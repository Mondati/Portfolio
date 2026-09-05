# Dependencias locales del fondo de partículas

## OGL 1.0.11

Autor: Nathan Gordon. Fuente: https://registry.npmjs.org/ogl/-/ogl-1.0.11.tgz
Commit publicado: b9e653ccac8e08211ce0678695d0a01f722e1fc2.
Integridad verificada: sha512-kUpC154AFfxi16pmZUK4jk3J+8zxwTWGPo03EoYA8QPbzikHoaC82n6pNTbd+oEaJonaE8aPWBlX7ad9zrqLsA==

Se incluyen sin cambios los módulos Renderer, Camera, Geometry, Program y Mesh
y el cierre transitivo de sus importaciones relativas (17 archivos). No se usa
el índice general, ni imports remotos, npm o un bundler en ejecución.

La licencia declarada en el package.json publicado es Unlicense. Ni el tarball
ni la raíz del commit incluyen un archivo LICENSE separado: se incorpora el
texto de la sección Unlicense del README de ese commit en ogl-1.0.11/LICENSE.

API de eliminación verificada en esta versión: Geometry.remove() borra buffers
y VAOs; Program.remove() borra el programa. Los shaders adjuntos se liberan con
gl.deleteShader(); Renderer y Mesh no ofrecen destroy(). Al destruir se pierde
explícitamente el contexto privado, si WEBGL_lose_context está disponible.

## Referencia React Bits Particles

Adaptación de la variante JavaScript + CSS aportada por el usuario, originalmente
de David Haz / React Bits: https://github.com/DavidHDev/react-bits .
Se conserva la licencia oficial consultada el 2026-09-04 en
react-bits-LICENSE.md (MIT + Commons Clause). La adaptación se integra como parte
de este portfolio; no es una redistribución independiente del componente.
