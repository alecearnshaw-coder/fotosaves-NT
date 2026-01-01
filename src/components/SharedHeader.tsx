interface SharedHeaderProps {
  showSearch?: boolean;
  showQuickLinks?: boolean;
  quickLinksContent?: React.ReactNode;
}

export default function SharedHeader({
  showSearch = true,
  showQuickLinks = false,
  quickLinksContent
}: SharedHeaderProps) {
  return (
    <>
      {/* Site Header */}
      <div className="heading-container">
        <div className="site-header-banded">
          <div className="site-header-band site-header-band-dark">
            <div className="headline">fotos <span style={{color:'#FF9966'}}>de animales silvestres</span> <span className="subheadline">de ARGENTINA</span></div>
          </div>
          <div className="site-header-band site-header-band-light">
            <div className="site-title-row">
              {showSearch && (
                <div id="species-search">
                  <button id="species-search-btn" title="Buscar especie / Search species">🔍</button>
                  <input type="text" id="species-search-input" placeholder="Buscar especie..." />
                  <div id="species-search-results"></div>
                </div>
              )}
              <div className="site-title">www.fotosaves.com.ar - <a href="mailto:aearnshaw@sinectis.com.ar">by Alec Earnshaw</a></div>
              <div className="copyright">© {new Date().getFullYear()} Alec Earnshaw</div>
            </div>
          </div>
          <div className="site-header-band site-header-band-dark">
            <div className="headline">photos <span style={{color:'#FF9966'}}>of wild animals</span> <span className="subheadline">of ARGENTINA</span></div>
          </div>
        </div>
        {showQuickLinks && (
          <div className="quick-links">
            {quickLinksContent || (
              <div className="links-left">
                <span className="label-es">Enlaces:</span>
                <a className="quick-link" href="/index_sp.html" title="Inicio del sitio (Español)">Cabecera del sitio</a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}