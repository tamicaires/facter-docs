import net from 'node:net';
const DELAY = Number(process.env.DELAY_MS ?? 0.75);   // por sentido: ida e volta = 2 × DELAY
net.createServer((client) => {
  const server = net.connect(5432, '127.0.0.1');
  client.setNoDelay(true); server.setNoDelay(true);
  const pipe = (from, to) => from.on('data', (chunk) => setTimeout(() => to.write(chunk), DELAY));
  pipe(client, server); pipe(server, client);
  const close = () => { client.destroy(); server.destroy(); };
  client.on('error', close); server.on('error', close); client.on('close', close); server.on('close', close);
}).listen(55432, () => console.log('proxy on 55432, delay per direction', DELAY, 'ms'));
