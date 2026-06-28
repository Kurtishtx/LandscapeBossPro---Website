export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <a href="/" className="site-footer-brand">
            <span>🌿</span>
            <span>LandscapeBossPro</span>
          </a>
          <div className="site-footer-cols">
            <div className="site-footer-col">
              <h4>Product</h4>
              <a href="/features">Features</a>
              <a href="/pricing">Pricing</a>
              <a href="https://my.landscapebosspro.com" target="_blank" rel="noreferrer">Log In</a>
            </div>
            <div className="site-footer-col">
              <h4>Solutions</h4>
              <a href="/lawn-care-software">Lawn Care Software</a>
              <a href="/lawn-care-scheduling-software">Lawn Care Scheduling</a>
              <a href="/mosquito-spray-software">Mosquito Spray</a>
              <a href="/mosquito-control-software">Mosquito Control</a>
              <a href="/pest-control-software">Pest Control</a>
              <a href="/pest-control-scheduling-software">Pest Control Scheduling</a>
              <a href="/weed-control-software">Weed Control</a>
              <a href="/fertilizer-software">Fertilizer Software</a>
              <a href="/spray-business-software">Spray Business</a>
            </div>
            <div className="site-footer-col">
              <h4>Compare</h4>
              <a href="/vs-jobber">vs. Jobber</a>
              <a href="/vs-servicetitan">vs. ServiceTitan</a>
              <a href="/vs-housecallpro">vs. Housecall Pro</a>
              <a href="/vs-gorilladesk">vs. GorillaDesk</a>
              <a href="/vs-fieldroutes">vs. FieldRoutes</a>
              <a href="/vs-serviceautopilot">vs. Service Autopilot</a>
              <a href="/vs-realgreen">vs. RealGreen</a>
              <a href="/vs-lawnpro">vs. LawnPro</a>
              <a href="/vs-aspire">vs. Aspire</a>
              <a href="/vs-clip">vs. CLIP</a>
              <a href="/vs-spraye">vs. Spraye</a>
            </div>
            <div className="site-footer-col">
              <h4>Resources</h4>
              <a href="/blogs">Blog</a>
            </div>
            <div className="site-footer-col">
              <h4>BossPro Family</h4>
              <a href="https://industrybosspro.com">IndustryBossPro</a>
            </div>
          </div>
        </div>
        <div className="site-footer-bottom">
          © {new Date().getFullYear()} LandscapeBossPro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
