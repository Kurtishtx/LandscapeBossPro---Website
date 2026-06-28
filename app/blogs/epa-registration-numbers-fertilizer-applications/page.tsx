import BlogShell from '../blog-shell';

export const metadata = {
  title: 'EPA Reg Numbers on Fertilizer Applications | LandscapeBossPro',
  description: 'A plain-language breakdown of what the EPA reg number requirement means for lawn care companies and how to capture it in the field.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Compliance &amp; Regulations</p>
        <h1>What EPA Registration Numbers Do You Need to Log on Fertilizer Applications?</h1>

        <p>EPA registration number requirements trip up a lot of lawn care and fertilizer companies — not because the requirement is complicated, but because it&apos;s easy to conflate what&apos;s required for pesticide applications with what applies to straight fertilizers. Here&apos;s a plain-language breakdown of what the law actually requires and how to make sure your application records are compliant.</p>

        <h2>The Difference Between Fertilizers and Pesticides for EPA Purposes</h2>
        <p>Pure fertilizers — products that contain only nutrients like nitrogen, phosphorus, and potassium with no pesticide components — are not regulated as pesticides under FIFRA (Federal Insecticide, Fungicide, and Rodenticide Act). They do not require EPA registration numbers because they aren&apos;t registered pesticides. The EPA registration number requirement applies specifically to pesticides.</p>
        <p>Where this gets complicated for fertilizer companies is combination products. Pre-emergent weed control combined with fertilizer (commonly called &quot;weed and feed&quot; products) contains a pesticide component and therefore carries an EPA registration number that must be logged. Grub control combined with fertilizer is the same — it&apos;s a pesticide product that requires full FIFRA compliance documentation including the EPA reg number.</p>

        <h2>Which Products Require EPA Reg Number Logging</h2>
        <p>A useful rule of thumb: if the product label says &quot;Keep Out of Reach of Children&quot; and includes a signal word like Caution, Warning, or Danger — it&apos;s a registered pesticide and requires full application documentation including the EPA registration number. Pure fertilizers without pesticide components don&apos;t carry these labels.</p>
        <p>Products that almost always require EPA reg number logging in a fertilizer program context:</p>
        <ul>
          <li>Pre-emergent herbicides (standalone or in combination with fertilizer)</li>
          <li>Post-emergent broadleaf herbicides</li>
          <li>Grub control products (imidacloprid, chlorantranilipole, etc.)</li>
          <li>Lawn insecticides</li>
          <li>Any &quot;weed and feed&quot; combination product</li>
        </ul>
        <p>Products that typically do not require EPA reg number logging:</p>
        <ul>
          <li>Straight NPK fertilizers with no pesticide content</li>
          <li>Slow-release fertilizers (SCU, MESA, polymer-coated urea)</li>
          <li>Iron supplements and micronutrient products</li>
        </ul>

        <h2>What State Law Adds on Top of Federal Requirements</h2>
        <p>FIFRA sets the federal baseline, but many states add their own requirements. Some states require commercial pesticide applicators to log every application of any regulated pesticide within 24 hours of application. Others require logs to include weather conditions (wind speed, temperature, precipitation), applicator license number, and re-entry intervals communicated to the customer. A few states have specific requirements for fertilizer application near waterways, regardless of whether the product is a pesticide.</p>
        <p>Knowing your state&apos;s specific requirements is important because noncompliance penalties can be significant — fines, license suspension, or both. Your state&apos;s department of agriculture is the authoritative source for current requirements in your area.</p>

        <h2>How to Capture EPA Reg Numbers in the Field</h2>
        <p>The EPA registration number is printed on every registered pesticide label, typically near the bottom of the front panel. It follows the format: XXXXXX-XXXXX (manufacturer registration number followed by product registration number). Technicians should record this number at the time of application — not from memory later.</p>
        <p>In purpose-built <a href="/fertilizer-software">fertilizer software</a>, you can store the EPA reg number on the product record when you add it to your product list. When a technician selects that product on their compliance log, the EPA reg number populates automatically. They don&apos;t have to find it on the label every time — they just select the product, confirm the application rate and area, and the system records everything required for compliance.</p>

        <h2>What a Compliant Application Record Looks Like</h2>
        <p>A compliant pesticide application record for a fertilizer program visit typically includes:</p>
        <ul>
          <li>Date of application</li>
          <li>Property address and total area treated (sq ft)</li>
          <li>Product name and EPA registration number</li>
          <li>Application rate (lbs per 1,000 sq ft for granular, oz per gallon per 1,000 sq ft for liquid)</li>
          <li>Total amount applied</li>
          <li>Weather conditions at time of application</li>
          <li>Applicator name and license number</li>
          <li>Re-entry interval communicated to customer</li>
        </ul>

        <h2>Storing Records and Producing Them on Demand</h2>
        <p>Most states require pesticide application records to be retained for two to three years and produced on demand during an inspection. Paper records stored in a binder are technically compliant but create real risk — binders get lost, records get damaged, and finding a specific application from 18 months ago takes time you may not have during an inspection.</p>
        <p>Digital records stored per-property in your software can be filtered by date, product, applicator, or property and exported as a compliance report in seconds. That&apos;s the practical advantage of field-logged digital records over paper.</p>

        <p>For a full picture of what a state inspector actually asks for during an audit, see <a href="/blogs/track-5-round-6-round-fertilizer-programs">How to Track 5-Round and 6-Round Fertilizer Programs Without Losing Count</a> — which covers how accurate round tracking supports your documentation at every level.</p>

        <div className="blog-cta-box">
          <h3>Log EPA reg numbers correctly on every application — from the field.</h3>
          <p>LandscapeBossPro stores EPA registration numbers on your product records and auto-populates them on every compliance log your technicians submit in the field.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: EPA registration numbers fertilizer, fertilizer application compliance, pesticide log EPA reg number, lawn care EPA requirements, FIFRA fertilizer applications, fertilizer compliance logging, pesticide application records
        </div>
      </article>
    </BlogShell>
  );
}
