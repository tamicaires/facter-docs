/**
 * Marca o produto que está sendo lido no `<html>`, para que o CSS possa trocar
 * a cor primária por seção.
 *
 * O primeiro carregamento é resolvido por um script inline em `headTags`
 * (docusaurus.config.ts), que roda antes da primeira pintura e evita o piscar
 * de azul ao abrir uma página do TechCare direto pela URL. Este módulo cuida da
 * navegação seguinte, que é client-side e não passa pelo `<head>` de novo.
 */

export function onRouteDidUpdate({location}: {location: Location}): void {
  const projeto = /^\/docs\/([^/]+)/.exec(location.pathname)?.[1];
  const html = document.documentElement;

  if (projeto) {
    html.setAttribute('data-project', projeto);
  } else {
    html.removeAttribute('data-project');
  }
}
