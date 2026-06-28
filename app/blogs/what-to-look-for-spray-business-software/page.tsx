import BlogShell from '../blog-shell';

export const metadata = {
  title: 'What to Look for in Spray Business Software | LandscapeBossPro',
  description: 'The specific features a spray company needs — waiting list, circle routing, compliance logs, SMS alerts — and how to evaluate tools against that list.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Buying Guide</p>
        <h1>What to Look for in Spray Business Software Before You Sign Up</h1>

        <p>Every spray business software vendor will tell you their platform handles scheduling, routing, customer communication, and compliance. The difference between platforms is in how — specifically how — each of these capabilities works, and whether the implementation fits the way a chemical application business actually operates. A demo that shows you a calendar with appointments doesn&apos;t tell you whether the platform supports interval-based auto-scheduling from completion. A compliance form shown in screenshots doesn&apos;t tell you whether the EPA reg number is typed manually or pre-filled from a product library. Asking specific questions about specific workflows separates platforms built for spray businesses from those adapted from generic field service tools.</p>

        <h2>Question 1: How Does the Waiting List Work?</h2>
        <p>The right answer: The waiting list shows all recurring accounts due across all service types, automatically surfaced based on program interval and last completion date. It&apos;s filterable by service type, geographic zone, and overdue status. It shows total sq ft and expected revenue for any filtered selection. It has a map view where due accounts appear as pins that can be selected via circle drawing to build routes.</p>
        <p>The wrong answer: Accounts that need service are tracked in a job queue or calendar view. You create a new job for each service visit when it&apos;s time to schedule it.</p>

        <h2>Question 2: How Does Auto-Scheduling Work After a Completion?</h2>
        <p>The right answer: When a technician marks a stop complete and submits the compliance log, the system automatically calculates the next due date from the completion date plus the configured program interval and creates a new pending record. The account appears in the waiting list on the calculated due date without any office action.</p>
        <p>The wrong answer: After a visit is marked complete, you create the next appointment manually. Or: the system has a recurring job feature, but it schedules from fixed calendar dates rather than from actual completion dates.</p>

        <h2>Question 3: How Does the Compliance Log Work?</h2>
        <p>The right answer: Technicians submit compliance logs via a mobile form at the property. The form has a product library that pre-fills EPA registration number, active ingredient, and re-entry interval when a product is selected. Required fields must be completed before submission. The submitted log is timestamped, attached to the property record, and immediately searchable in the office.</p>
        <p>The wrong answer: You can build custom forms for compliance logging. Technicians fill them in on paper or in a general-purpose notes field.</p>

        <h2>Question 4: How Do SMS Alerts Work?</h2>
        <p>The right answer: Day-before reminders fire automatically when a route is dispatched. Post-service confirmations fire when a compliance log is submitted, and include the re-entry interval from the specific product logged in that visit — not a static template interval. SMS templates are configurable by service type.</p>
        <p>The wrong answer: You can send SMS from the platform manually. Or: there&apos;s an integration with a third-party SMS tool that you configure separately.</p>

        <h2>Question 5: Is It Built for Spray/Chemical Application Businesses Specifically?</h2>
        <p>The right answer: The software is designed for companies applying chemical treatments on recurring programs — fertilizer, pest control, weed control, mosquito. These program types are native concepts in the platform. The compliance log is a first-class feature, not a custom form. The waiting list is the primary scheduling interface, not a secondary view.</p>
        <p>The wrong answer: The platform serves HVAC, plumbing, electrical, cleaning, and lawn care companies. Spray-specific features are available through customization.</p>
        <p>Purpose-built <a href="/spray-business-software">spray business software</a> answers all five questions correctly by design — not through configuration or workarounds.</p>

        <p>For how multi-crew operations are evaluated in a demo, see <a href="/blogs/manage-spray-business-multiple-crews">How to Manage a Spray Business Across Multiple Crews and Service Areas</a>.</p>

        <div className="blog-cta-box">
          <h3>Five questions that separate purpose-built spray software from generic tools that technically work.</h3>
          <p>LandscapeBossPro answers all five correctly — auto-scheduling from completion dates, product library compliance logs, automatic service-specific SMS alerts, and a waiting list map built for spray business dispatching.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: what to look for spray business software, spray business software evaluation, spray company software buying guide, spray software features checklist, best spray business software, spray company software selection
        </div>
      </article>
    </BlogShell>
  );
}
