import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Property Notes and Details in Lawn Care Software | LandscapeBossPro',
  description: 'How lawn care software stores property notes, access instructions, and service details so every technician has the right information before arriving at the stop.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Lawn Care Software</p>
        <h1>How to Manage Client Notes and Property Details in Lawn Care Software</h1>

        <p>A lawn care technician arriving at a property without knowing the gate code, without knowing a dog is in the backyard, or without knowing the customer wants a courtesy call before entry is not operating at full professional capacity — even if they&apos;re excellent at applying product. The gap between a technically skilled technician and a professionally excellent one is often information: the property-specific details that make every visit smooth, that prevent the callback about the trampled flower bed, and that give the customer confidence that the company knows their property and respects it. Lawn care software that manages client notes and property details correctly closes this gap on every stop, on every route, on every visit.</p>

        <h2>Office Notes vs. Field Notes</h2>
        <p>In <a href="/lawn-care-software">lawn care software</a>, there is a meaningful distinction between office notes and field notes. Office notes are internal — visible to the dispatcher and accessible in the customer record, but not necessarily dispatched to the field technician on every visit. Field notes (or property notes) are the details that belong with every dispatched stop: gate codes, animal warnings, access instructions, parking notes, customer preferences. These dispatch automatically with every route and appear on the technician&apos;s mobile screen before they pull into the driveway.</p>

        <h2>What to Store in Property Notes</h2>
        <p>Property notes that prevent operational problems are worth storing. The most useful ones address situations that would cause the technician to pause, call the office, or skip the stop if they didn&apos;t have the information. Common examples that should always be in the property record:</p>
        <ul>
          <li>Gate codes and access points — front gate, side fence, locked shed</li>
          <li>Dog warning — breed, name if needed, whether the dog is usually outside</li>
          <li>Knock before entry — customer wants advance notice before the technician goes to the back</li>
          <li>Neighbor instructions — skip the tree line that belongs to the adjacent property</li>
          <li>Irrigation heads in specific zones to work around</li>
          <li>Seasonal notes — &quot;only treat turf in back after May 1&quot;</li>
        </ul>
        <p>Notes that answer &quot;what would the technician need to know before treating this property today?&quot; belong in the property record. Notes that answer &quot;what does the office need to know about billing or communication history?&quot; belong in the office notes section.</p>

        <h2>Custom Fields: Extending the Standard Record</h2>
        <p>Every lawn care business has property-specific data requirements that don&apos;t fit standard fields. Custom fields in lawn care software let the business define additional data points — irrigation system brand, spray system type, HOA approval status, preferred treatment window, or any other operational detail specific to that company&apos;s workflow. Custom fields appear on the property record and, if configured, can be included in the dispatched stop view so technicians see them in the field.</p>

        <h2>Tags for Quick Segmentation</h2>
        <p>Tags on client and property records allow the office to segment accounts by any operational characteristic — &quot;VIP&quot;, &quot;no solicitation&quot;, &quot;payment plan&quot;, &quot;multi-property discount&quot;, &quot;review pending&quot;. These tags make it possible to filter the client list or property list to a specific segment without a database export or manual spreadsheet review. For marketing follow-up, collections, or any operational workflow that applies to a specific subset of accounts, tags are the fastest path from &quot;I need to reach all customers who X&quot; to a filtered list ready for action.</p>

        <p>For how property sq ft data in the same record drives daily route capacity planning, see <a href="/blogs/lawn-care-software-route-revenue">How Lawn Care Software Calculates Route Revenue Before You Build the Route</a>.</p>

        <div className="blog-cta-box">
          <h3>Gate code. Dog in yard. Knock before entry. The technician sees it all before they pull in.</h3>
          <p>LandscapeBossPro property notes, custom fields, and tags give every technician complete property context on every dispatched stop — no phone calls to the office required.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: lawn care software client notes, lawn care software property details, lawn care property notes dispatch, lawn care software access instructions, lawn care software tags, lawn care software custom fields
        </div>
      </article>
    </BlogShell>
  );
}
