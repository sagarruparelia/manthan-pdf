import caLogo from '../assets/ca-logo.jpg';

function Header() {
  return (
    <header className="header">
      <div className="branding">
        <img className="ca-logo" src={caLogo} alt="ICAI Logo" />
        <div className="brand-text">
          <h1 className="firm-name">Manthan Ruparelia & Associates</h1>
          <p className="firm-subtitle">CHARTERED ACCOUNTANTS</p>
        </div>
      </div>
      <p className="header-description">
        PDF Merge & Sequence Manager - Drag files to reorder, add watermarks, and export to Excel.
      </p>
    </header>
  );
}

export default Header;
