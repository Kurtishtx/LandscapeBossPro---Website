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
              <a href="/landscaping-software">Landscaping Software</a>
              <a href="/landscape-estimating-software">Landscape Estimating</a>
              <a href="/landscape-scheduling-software">Landscape Scheduling</a>
              <a href="/landscape-crew-dispatch-software">Crew & Dispatch</a>
              <a href="/landscaping-invoicing-software">Invoicing & Billing</a>
              <a href="/landscape-business-software">Landscape Business</a>
              <a href="/landscape-maintenance-software">Landscape Maintenance</a>
              <a href="/landscape-customer-management-software">Customer Management</a>
            </div>
            <div className="site-footer-col">
              <h4>Compare</h4>
              <a href="/vs-jobber">vs. Jobber</a>
              <a href="/vs-servicetitan">vs. ServiceTitan</a>
              <a href="/vs-aspire">vs. Aspire</a>
              <a href="/vs-lmn">vs. LMN</a>
              <a href="/vs-yardbook">vs. Yardbook</a>
              <a href="/vs-singleops">vs. SingleOps</a>
              <a href="/vs-serviceautopilot">vs. Service Autopilot</a>
              <a href="/vs-housecallpro">vs. Housecall Pro</a>
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
