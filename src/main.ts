const inputLine = document.getElementById('input-line');

inputLine?.addEventListener('input', (e: Event) => {
  const target = e.target as HTMLInputElement;
  const inputText = target.value.toLowerCase();
  console.log(inputText);
});
