export default function ContactLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href =
      'mailto:' +
      'fotosaves.contact' +
      '@' +
      'gmail.com' +
      '?subject=FotosAves%20feedback';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
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
