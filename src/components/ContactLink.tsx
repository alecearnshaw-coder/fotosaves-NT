export default function ContactLink() {
  const handleClick = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    window.location.href =
      'mailto:' +
      'fotosaves.contact' +
      '@' +
      'gmail.com' +
      '?subject=FotosAves%20feedback';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick(e);
    }
  };

  return (
    <a
      href="#"
      role="link"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      Contáctame aquí - Contact me here
    </a>
  );
}
