import "./App.css";

function IconHome() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"
      />
    </svg>
  );
}

function IconShop() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg className="nav-icon nav-icon--fab" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

export function App() {
  return (
    <div className="app-shell">
      <div className="phone-frame">
        <header className="app-header">
          <div className="logo-placeholder" aria-label="Logo PBB">
            PBB
          </div>
        </header>

        <main className="app-main">
          <section className="section section--news">
            <h1 className="greeting">Hey User!</h1>
            <h2 className="section-title">Latest News</h2>
            <ul className="news-list">
              <li className="news-card" />
              <li className="news-card" />
              <li className="news-card" />
            </ul>
          </section>

          <section className="section section--wings">
            <h2 className="wings-heading">Sayap Parti</h2>
            <ul className="wings-row">
              {(["MKT", "Wanita", "Pemuda", "Belia"] as const).map((label) => (
                <li key={label} className="wing-item">
                  <button type="button" className="wing-button">
                    <span className="wing-circle" />
                    <span className="wing-label">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <nav className="bottom-nav" aria-label="Navigasi utama">
          <a className="nav-item" href="#home">
            <IconHome />
            <span>Home</span>
          </a>
          <a className="nav-item" href="#shop">
            <IconShop />
            <span>Shop</span>
          </a>
          <a className="nav-item nav-item--fab" href="#chat" aria-label="Chat">
            <span className="fab-circle">
              <IconChat />
            </span>
          </a>
          <a className="nav-item" href="#search">
            <IconSearch />
            <span>Search</span>
          </a>
          <a className="nav-item" href="#profile">
            <IconProfile />
            <span>Profile</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
