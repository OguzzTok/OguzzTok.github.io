/**
 * Yatay kaydırılan bir şeritte (sekme çubuğu, küçük resimler) öğeyi görünür yapar.
 * element.scrollIntoView() sayfayı da dikey kaydırdığı için kullanılmaz.
 */
export function revealHorizontally(container: HTMLElement, element: HTMLElement, margin = 16) {
  const box = container.getBoundingClientRect();
  const item = element.getBoundingClientRect();
  if (item.left < box.left) container.scrollLeft -= box.left - item.left + margin;
  else if (item.right > box.right) container.scrollLeft += item.right - box.right + margin;
}
