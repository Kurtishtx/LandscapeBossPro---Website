import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Mosquito Spray: Sq Ft vs Linear Ft Pricing | LandscapeBossPro',
  description: 'How to choose between sq ft and linear ft pricing for mosquito barrier spray programs — and how software tracks both measurement types across your customer base.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Mosquito Spray Software</p>
        <h1>Sq Ft vs. Linear Ft Pricing for Mosquito Barrier Spray — Which Works Better?</h1>

        <p>Mosquito barrier spray pricing divides the industry into two camps: sq ft pricing and linear ft pricing. Both are legitimate approaches that work for different property types and different service models. The debate usually comes down to one practical question: which measurement more accurately captures the actual treatment area and product cost for your typical customer? For a mosquito spray business with diverse property types, the answer may be &quot;both&quot; — sq ft for open lawn treatment, linear ft for perimeter and vegetation-edge barrier sprays. Understanding which model fits your operation, and having software that tracks both, is the foundation of profitable mosquito spray pricing.</p>

        <h2>Sq Ft Pricing: When to Use It</h2>
        <p>Sq ft pricing works best when the barrier spray covers a broadly distributed treatment area — the entire back yard, the full perimeter of a property including open lawn areas, or properties where foliage coverage is the primary treatment target. A sq ft rate applied to the treatable area of the property gives a price that scales naturally with property size. A 15,000 sq ft property at $0.008/sq ft bills at $120 per treatment. A 30,000 sq ft property bills at $240. The pricing is intuitive to customers and scales consistently with the scope of treatment.</p>

        <h2>Linear Ft Pricing: When to Use It</h2>
        <p>Linear ft pricing works best when the barrier spray is applied along defined edges — fence lines, tree lines, property perimeters, shrub rows, or wooded borders. In this model, the treatment is measured by the length of the treatment line rather than the area covered. A property with 800 linear ft of vegetation edge at $0.18/linear ft bills at $144 per treatment. Linear ft pricing is preferred when treatment intensity along edges is the product being sold, not coverage of an open area, and when the time-to-treat correlates more closely to perimeter length than to enclosed area.</p>

        <h2>How Software Handles Both</h2>
        <p>In <a href="/mosquito-spray-software">mosquito spray software</a>, each property&apos;s Area Treated record stores both Mosquito Control Sq Ft and Mosquito Control Linear Ft independently. A property can have both measurements stored — and the service linked to each measurement type uses the appropriate unit for its pricing calculation. Sq ft services calculate their rate against the stored sq ft. Linear ft services calculate against the stored linear ft. The waiting list totals both measurements separately so the dispatcher sees aggregate sq ft waiting and aggregate linear ft waiting for the day&apos;s mosquito routes simultaneously.</p>

        <h2>Displaying Both on the Waiting List</h2>
        <p>When the waiting list is filtered to mosquito treatments, the column totals show both Mosquito Control Sq Ft and Mosquito Control Linear Ft for all due accounts. A dispatcher building a 15-stop mosquito route can see, before building the route, that the selected stops total 185,000 sq ft of area treatment and 3,200 linear ft of perimeter treatment — and can plan product volume accordingly before leaving the shop. This dual-measurement visibility is a feature that requires software built specifically for the mosquito spray model, not a generic field service tool adapted for the purpose.</p>

        <p>For how the single platform handles this pricing in the context of the full mosquito spray operation, see <a href="/blogs/run-mosquito-spray-business-single-platform">How to Run a Mosquito Spray Business From a Single Platform</a>.</p>

        <div className="blog-cta-box">
          <h3>Sq ft pricing. Linear ft pricing. Both stored per property. Both totaled on the waiting list. Software built for the way mosquito spray actually works.</h3>
          <p>LandscapeBossPro tracks mosquito control sq ft and linear ft separately per property, totals both on the waiting list, and supports per-unit pricing for each — so your pricing model fits your service model exactly.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: mosquito spray sq ft vs linear ft pricing, mosquito barrier spray pricing model, mosquito spray linear ft pricing, mosquito control sq ft pricing, mosquito spray pricing software, barrier spray measurement pricing
        </div>
      </article>
    </BlogShell>
  );
}
