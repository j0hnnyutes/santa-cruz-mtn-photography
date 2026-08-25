export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/base.css" />
      <link rel="stylesheet" href="/blog-assets/blog.css" />

      <div className="inner-page">
        <header className="site-nav">
          <a className="site-nav__brand" href="/">
            Santa Cruz Mountain Photography
          </a>
          <nav className="site-nav__links">
            <a href="/">Home</a>
            <a href="/about/">About</a>
            <a href="/gallery/">Gallery</a>
            <a href="/blog/">Blog</a>
            <a className="site-nav__cta" href="mailto:law138@santacruzmtnphotography.com">
              Contact
            </a>
          </nav>
        </header>

        {children}

        <footer className="footer">
          <span className="social-group">
            <a
              className="social"
              href="https://www.instagram.com/santacruzmtnphotography"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Santa Cruz Mountain Photography on Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
              </svg>
            </a>
            <a
              className="social"
              href="https://www.facebook.com/share/1EiTQgBbLn/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Santa Cruz Mountain Photography on Facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.917 3.777-3.917 1.094 0 2.238.197 2.238.197v2.475h-1.26c-1.243 0-1.63.775-1.63 1.57v1.89h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
              </svg>
            </a>
          </span>
          <span className="dot">&middot;</span>
          <span>
            &copy; {year} Santa Cruz Mountain Photography
          </span>
        </footer>
      </div>
    </>
  );
}
