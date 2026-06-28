import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Mosquito Spray: Linear Foot Measurement Tracking | LandscapeBossPro',
  description: 'How linear ft measurements are stored per property, used for pricing, displayed on the waiting list, and tracked in the chemical compliance report for perimeter barrier spray applications.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Mosquito Spray Software</p>
        <h1>How Mosquito Spray Software Handles Linear Foot Measurements for Barrier Spray</h1>

        <p>Linear foot barrier spray — where the billable measurement is the length of the treatment edge rather than the area of the treated surface — is a common and often more accurate model for perimeter-focused mosquito applications. A property with 800 linear feet of fence line, shrub border, and wooded perimeter edge gets priced by the perimeter measurement, which reflects the actual treatment work more accurately than sq ft when the treatment is edge-specific rather than distributed across open lawn area. <a href="/mosquito-spray-software">Mosquito spray software</a> stores linear ft as a first-class measurement field per property — not as a workaround in a notes field — so it flows through the system the same way sq ft does: pricing calculations, waiting list totals, route-building displays, and chemical compliance records.</p>

        <h2>Storing Linear Ft Per Property</h2>
        <p>In the property record, linear ft for mosquito spray (Mosquito Control Linear Ft) is stored as a distinct measurement separate from sq ft (Mosquito Control Sq Ft). A property can have both measurements — for example, 12,000 sq ft of open back yard coverage and 650 linear ft of rear fence line perimeter — if the company applies both area and perimeter treatments at the same property. Each measurement is linked to the service type that uses it: a Mosquito Linear Ft service pulls its pricing calculation from the linear ft measurement; a Mosquito Sq Ft service pulls from the sq ft measurement. The two can coexist on the same property without conflating the measurements.</p>

        <h2>Linear Ft on the Waiting List</h2>
        <p>When the waiting list is filtered to mosquito treatments, the column totals include Mosquito Control Linear Ft alongside Mosquito Control Sq Ft. A dispatcher reviewing a day&apos;s due accounts sees not just the count of stops and their sq ft totals, but the linear ft of perimeter barrier treatment waiting across the due accounts. This matters for product volume planning: a linear ft application may use significantly different product volume per stop than an equal-time sq ft application, depending on how concentrated the edge treatment needs to be. Knowing the linear ft total before building the route informs product mix volume loaded on the truck for that specific day&apos;s account composition.</p>

        <h2>Linear Ft Pricing: How It Calculates Per Treatment</h2>
        <p>A service configured for linear ft pricing calculates the treatment charge as: linear ft stored on the property × the per-linear-ft rate for that service. A property with 800 linear ft at a $0.18/linear ft rate bills at $144 per treatment, automatically, every time that service is scheduled and completed. No manual price entry. No rate lookup. The measurement stored once determines the charge for every treatment throughout the season. If the rate changes at the start of a new season, the service configuration update propagates to every property using that service type — no account-by-account repricing required.</p>

        <h2>Linear Ft in the Chemical Compliance Record</h2>
        <p>The chemical compliance record created at each treatment completion includes the treatment area type and measurement. For a linear ft application, the compliance record captures &quot;Mosquito Control Linear Ft: 800&quot; alongside the product, rate, EPA registration number, and date. The full-season chemical tracking report can then show the aggregate linear ft treated per product — which supports both compliance documentation and end-of-season product usage reconciliation for inventory and cost analysis.</p>

        <p>For the broader context of when to use linear ft vs. sq ft pricing, see <a href="/blogs/close-mosquito-spray-season-last-treatments">How to Close the Season for a Mosquito Spray Business — Last Treatments and Customer Communication</a>.</p>

        <div className="blog-cta-box">
          <h3>Linear ft stored per property. Shown on the waiting list. Calculated in pricing. Captured in the compliance record. First-class measurement — not a notes field workaround.</h3>
          <p>LandscapeBossPro treats mosquito spray linear ft as a native measurement field — stored per property, totaled on the waiting list, used in per-treatment pricing calculations, and recorded in the chemical compliance log.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: mosquito spray linear foot measurements software, barrier spray linear ft pricing software, mosquito spray linear ft waiting list, mosquito control linear foot property measurement, mosquito spray perimeter linear ft software, barrier spray linear foot measurement tracking
        </div>
      </article>
    </BlogShell>
  );
}
