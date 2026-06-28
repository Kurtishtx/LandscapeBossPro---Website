import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Track Pre- and Post-Emergent Programs Separately | LandscapeBossPro',
  description: 'Why pre-emergent and post-emergent rounds need separate tracking, separate compliance logs, and separate SMS templates.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Program Management</p>
        <h1>How to Track Pre-Emergent and Post-Emergent Programs Separately in One System</h1>

        <p>A customer enrolled in a full weed control program may receive both pre-emergent applications (spring and fall) and post-emergent treatments (multiple rounds across the growing season) under the same account. These are distinct service types with different products, different scheduling logic, different compliance fields, and different customer communication requirements. Tracking them under the same service type in a shared scheduling queue creates confusion in compliance logs, inaccurate round numbers, and incorrect SMS messages. They need to be tracked separately — even when they&apos;re serving the same customer.</p>

        <h2>Why Combined Tracking Fails</h2>
        <p>When pre-emergent and post-emergent are treated as one service type, several problems emerge. Round numbering breaks: a customer who received pre-emergent in March and three post-emergent visits by July shouldn&apos;t show &quot;Round 4&quot; on their next post-emergent — the pre-emergent wasn&apos;t part of the post-emergent sequence. Compliance logs for the two service types require different fields: pre-emergent often uses granular application tracked by sq ft per bag; post-emergent is typically liquid tracked by gallons applied at a specific rate per 1,000 sq ft. Putting both in one log type produces incomplete records for both.</p>
        <p>SMS templates also differ. The re-entry interval for a granular pre-emergent is typically &quot;water in within 48 hours&quot; plus a short REI. The post-emergent SMS instructs the customer to stay off the lawn until dry, provides the REI, and may include watering instructions specific to the post-emergent product. A single template that covers both will be wrong for at least one of them on every send.</p>

        <h2>Service Type Configuration in Purpose-Built Software</h2>
        <p>In purpose-built <a href="/weed-control-software">weed control software</a>, each service type is configured independently: separate waiting list entries, separate scheduling intervals, separate compliance log templates, and separate SMS alert templates. A customer enrolled in both pre-emergent and post-emergent programs has two separate service queues on their account. When pre-emergent season opens, their pre-emergent entry appears in the pre-emergent waiting list. When a post-emergent round is due, the post-emergent entry appears in the post-emergent queue. The dispatcher sees them as distinct services, routes them appropriately, and the compliance log for each visit captures the data specific to that service type.</p>

        <h2>Managing Both Programs for the Same Customer</h2>
        <p>When a customer has both programs active, some visits will be combination visits — particularly when a spring pre-emergent coincides with a post-emergent that&apos;s also due. The system needs to show both services due for that customer so the technician can address both in a single stop. This combination visibility — &quot;This stop has a pre-emergent AND a post-emergent due&quot; — should be clear on the dispatcher&apos;s view and the technician&apos;s mobile stop card.</p>
        <p>The compliance log for that stop should produce two separate records: one for the pre-emergent application (product, rate, granular area covered) and one for the post-emergent application (product, EPA reg number, liquid rate, area sprayed, conditions). Both records must be independently complete for compliance purposes.</p>

        <h2>The Waiting List View Across Both Programs</h2>
        <p>On any given routing day, the waiting list should clearly separate pre-emergent and post-emergent pending accounts. A dispatcher who sees 80 pre-emergent accounts and 35 post-emergent accounts due this week understands the work differently than one looking at 115 undifferentiated &quot;weed control&quot; stops. The service type breakdown drives routing decisions: pre-emergent accounts get prioritized based on window urgency; post-emergent accounts are routed by geographic density and days overdue.</p>

        <p>For the field logging details that make separate compliance records work correctly per service type, see <a href="/blogs/log-epa-reg-numbers-weed-control">How to Log EPA Reg Numbers for Weed Control Products in the Field</a>.</p>

        <div className="blog-cta-box">
          <h3>Pre-emergent and post-emergent tracked as separate programs — under the same customer account.</h3>
          <p>LandscapeBossPro lets you configure pre-emergent and post-emergent as distinct service types with separate waiting lists, compliance log templates, and SMS alerts — no combined tracking, no mixed-up round numbers.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: track pre-emergent post-emergent separately, weed control program tracking, pre-emergent post-emergent separate logs, weed control service types, separate pre-emergent post-emergent scheduling, weed control compliance records separate
        </div>
      </article>
    </BlogShell>
  );
}
