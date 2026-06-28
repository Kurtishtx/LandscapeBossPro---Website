import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Build a Mosquito Spray Route With Circle Mapping | SprayBossPro',
  description: 'How circle map routing (Lasso) builds a complete mosquito barrier spray route in under 10 minutes — from drawing the circle to dispatched route with sq ft and revenue totals.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">SprayBossPro Blog &mdash; Mosquito Spray Software</p>
        <h1>How to Build a Mosquito Spray Route Using Circle Map Routing</h1>

        <p>Building a mosquito spray route by hand — sorting a list of addresses into a logical geographic sequence, estimating drive time between stops, making sure the route doesn&apos;t backtrack — is a 30 to 45 minute process that produces a result that&apos;s geographically approximate at best. A dispatcher sorting 18 addresses by memory or by Google Maps cross-referencing is working at the limits of what manual geographic judgment can do. Circle map routing eliminates this problem entirely: instead of sorting stops from a list, the dispatcher selects stops from a map — drawing a circle around the neighborhood cluster they want to route, seeing every due mosquito treatment inside that circle instantly, and dispatching the optimized drive sequence in under 10 minutes.</p>

        <h2>Step 1: Open the Waiting List Map View</h2>
        <p>The waiting list in <a href="/mosquito-spray-software">mosquito spray software</a> has a map view that shows every due mosquito treatment as a pin on a live map. Pins for properties due today are highlighted. Overdue properties may appear in a different color. The dispatcher can see at a glance where the concentration of due treatments is before drawing a single circle — which neighborhood has the densest cluster of due stops, which area is isolated and might be best combined with another zone, and where the geographic distribution suggests multiple route days vs. a single consolidated route.</p>

        <h2>Step 2: Draw the Circle (Lasso)</h2>
        <p>The Lasso tool lets the dispatcher draw any size and shape selection around the map pins they want to include in a route. As the circle is drawn, the software immediately calculates: number of stops selected, total sq ft of mosquito treatment selected, total linear ft selected, and expected route revenue for the selected set. This real-time feedback lets the dispatcher assess whether the selected cluster is a full-day route before committing to it. If the selected set shows 14 stops at 180,000 sq ft and $1,680 in revenue, that&apos;s a strong single-crew route day. If it shows 7 stops at 90,000 sq ft and $840, the dispatcher expands the circle to pull in more stops from adjacent areas.</p>

        <h2>Step 3: Build and Assign the Route</h2>
        <p>After the stops are selected, the dispatcher assigns the route to a date and truck with one action. The software optimizes the drive order for the selected stops — sequencing them to minimize drive time across the geographic cluster. The resulting route is a dispatchable stop list with optimized sequence, ready to send to the technician&apos;s mobile device.</p>

        <h2>Step 4: Dispatch to the Field</h2>
        <p>Dispatching the route sends the full stop list — property addresses, notes, service type, and compliance log forms — to the assigned technician&apos;s mobile device. The pre-service SMS fires to every customer on the route simultaneously. The technician has everything they need to execute the route without a single phone call from the office. Total time from opening the waiting list map to dispatched route: 8 to 12 minutes.</p>

        <p>For how the seasonal context affects which properties show on the map each day, see <a href="/blogs/mosquito-spray-software-seasonal-startup-shutdown">How Mosquito Spray Software Handles Seasonal Program Start and Shutdown</a>.</p>

        <div className="blog-cta-box">
          <h3>Open the map. Draw the circle. See the sq ft and revenue. Build the route. Dispatch. Under 10 minutes.</h3>
          <p>SprayBossPro&apos;s Lasso circle routing builds mosquito spray routes geographically in under 10 minutes — with real-time sq ft and revenue totals for the selected set before you commit to a single stop.</p>
          <a href="https://my.spraybosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: build mosquito spray route circle map, mosquito spray route building software, mosquito barrier spray route software, circle map mosquito spray routing, mosquito spray lasso routing, mosquito spray route planning software
        </div>
      </article>
    </BlogShell>
  );
}
