import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Price Spray Services by Square Foot or Linear Foot | LandscapeBossPro',
  description: 'How to structure per-sq-ft and per-linear-ft pricing for different service types and track program revenue per stop and per route.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Pricing</p>
        <h1>How to Price Spray Services by Square Foot or Linear Foot</h1>

        <p>Flat-rate pricing for spray services — a fixed price per property regardless of size — is the fastest way to underprice large properties and overprice small ones. A 4,500-sq-ft turf area and a 12,000-sq-ft turf area both take the same pricing structure but require very different amounts of product and time. Per-sq-ft pricing corrects this by tying the service price to the area being treated. It also makes the pricing model transparent to customers (&quot;we charge $X per 1,000 sq ft&quot;) and makes route revenue calculation straightforward — total sq ft on a route multiplied by the per-sq-ft rate gives the expected revenue before you build the route.</p>

        <h2>Per-Sq-Ft Pricing by Service Type</h2>
        <p>Different spray service types carry different per-sq-ft rates based on product cost, application time, and market pricing in your area. Common frameworks:</p>
        <ul>
          <li><strong>Fertilizer programs</strong>: $0.006 to $0.012 per sq ft per round, depending on granular vs. liquid and product quality tier</li>
          <li><strong>Weed control (pre-emergent)</strong>: $0.005 to $0.010 per sq ft</li>
          <li><strong>Weed control (post-emergent)</strong>: $0.007 to $0.014 per sq ft, often higher due to targeted application labor</li>
          <li><strong>Pest control (exterior perimeter)</strong>: $0.03 to $0.06 per linear foot of perimeter, or flat-rate tier by lot size</li>
          <li><strong>Mosquito treatment</strong>: Often priced by lot size tier or per-sq-ft of treatable area (turf and vegetation, not structure)</li>
        </ul>
        <p>These ranges vary substantially by region, competition, and service depth. The key is consistency within your pricing model — once you set a per-sq-ft rate for each service type, every quote uses the same structure, making pricing predictable for both the business and the customer.</p>

        <h2>How Property Sq Ft Drives the Waiting List</h2>
        <p>When property sq ft is stored on every account in purpose-built <a href="/spray-business-software">spray business software</a>, the waiting list can display total sq ft for any filter selection — today&apos;s due accounts, a specific service type, or a geographic circle on the map. A dispatcher who sees that the north zone circle contains 22 fertilizer stops at 148,000 total sq ft knows immediately whether one truck can complete that work in a standard service day (typically 80,000 to 120,000 sq ft per truck per day, depending on terrain and access). This capacity check happens before the route is built, from information the software already has.</p>

        <h2>Sq Ft-Based Revenue Calculation Per Route</h2>
        <p>With per-sq-ft pricing and stored property areas, route revenue is calculable before dispatch. Total sq ft in the route multiplied by the per-sq-ft rate for the service type gives the expected revenue. If fertilizer Round 3 routes carry $0.009/sq ft and the morning route contains 112,000 sq ft of fertilizer work, that&apos;s $1,008 in expected route revenue before the first truck leaves. This pre-route revenue number is how dispatchers make informed decisions about whether to add stops to a light route or split a heavy one across two crews.</p>

        <h2>Linear Foot Pricing for Perimeter Services</h2>
        <p>Some spray services — particularly pest control exterior perimeter treatments and some irrigation edge applications — are more accurately priced per linear foot of property perimeter than per sq ft of total area. A property with a large setback and a relatively small perimeter may cost less to treat than a property with a similar square footage but complex perimeter geometry. Storing perimeter linear footage alongside lot sq ft allows accurate per-linear-ft pricing for these service types and gives technicians accurate product volume expectations before arriving.</p>

        <p>For how field technicians are managed with this pricing and area data available on every dispatched stop card, see <a href="/blogs/manage-spray-technicians-field">How to Manage Spray Technicians in the Field Without Calling Them All Day</a>.</p>

        <div className="blog-cta-box">
          <h3>Per-sq-ft and per-linear-ft pricing. Route revenue calculated before dispatch. Total sq ft visible in the waiting list.</h3>
          <p>LandscapeBossPro stores property sq ft and linear footage on every account and calculates route revenue automatically in the waiting list — so dispatchers see expected revenue before building a single route.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: price spray services square foot, spray business pricing square foot, spray service per sq ft pricing, spray business linear foot pricing, spray pricing structure, spray company pricing model
        </div>
      </article>
    </BlogShell>
  );
}
