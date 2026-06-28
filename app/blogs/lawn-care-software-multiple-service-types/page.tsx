import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Lawn Care Software for Multiple Service Types | LandscapeBossPro',
  description: 'How lawn care software manages fertilizer, weed control, pest control, mosquito, and flower bed services for the same customer under a single account — and keeps each service type separately trackable.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Lawn Care Software</p>
        <h1>How Lawn Care Software Handles Multiple Service Types Under One Account</h1>

        <p>A customer who enrolled in a fertilizer and weed control program in April and added a mosquito control program in May and called about pest control in June is one customer with three simultaneous service programs, each with its own product, application interval, sq ft measurement, and pricing. Managing this customer in a manual or generic system requires tracking three separate schedules, three separate due dates, and three separate sq ft sets — and updating all three independently after each service. In purpose-built lawn care software, all three programs live under the same property record, each with its own waiting list entry and auto-scheduling behavior, visible as separate services in the same workflow without any manual tracking overhead.</p>

        <h2>Multiple Service Types on One Property</h2>
        <p>In <a href="/lawn-care-software">lawn care software</a>, a property can have services across any combination of the service area types: Lawn Sq Ft (fertilizer, weed control), Lawn Insect Sq Ft, Flower Bed(s) Sq Ft, Mosquito Control Sq Ft (or Linear Ft), and Pest Control Sq Ft (or Linear Ft). Each area type has its own sq ft measurement stored on the property record. Each service is linked to its associated area type, so the right sq ft is used for the right service.</p>

        <h2>How the Waiting List Shows Multiple Services per Customer</h2>
        <p>When a customer has both a fertilizer Round 3 and a mosquito control service due in the same week, both appear as separate rows in the waiting list — same customer, same property, two different services. The dispatcher sees both entries, can schedule them on the same route if it makes geographic sense, or schedule them separately. Each entry has its own service type, its own amount, and its own sq ft total. The waiting list totals respect this structure — when filtered by service type, only the relevant services appear in the count and sq ft total.</p>

        <h2>Package Plans for Multi-Service Programs</h2>
        <p>A single package plan can include multiple service types — a 7-round lawn care and pest control combination package, for example, might include 4 rounds of fertilizer/weed control, 3 rounds of lawn insect, and 3 pest control perimeter treatments. When this package is assigned to a property, all included services are created in the waiting list at their respective sq ft areas and rates. The entire multi-service program is set up in a single package assignment action.</p>

        <h2>Service-Type Filtering for Route Planning</h2>
        <p>A company that runs dedicated fertilizer routes on Tuesdays and pest control routes on Thursdays can filter the waiting list to the relevant service type before building each day&apos;s route. The fertilizer route builder sees only fertilizer and weed control accounts. The pest control route builder sees only pest control accounts. No cross-contamination of service types, no mixed routes that require technicians to carry unnecessary product sets. The service-type filter is the simplest tool for maintaining route discipline in a multi-service operation.</p>

        <p>For the full feature checklist that makes multi-service management work in purpose-built lawn care software, see <a href="/blogs/lawn-care-software-features">The Features Every Lawn Care Software Needs (And Most Are Missing)</a>.</p>

        <div className="blog-cta-box">
          <h3>Fertilizer. Mosquito control. Pest control. Flower beds. One customer. Four programs. Zero manual cross-tracking.</h3>
          <p>LandscapeBossPro handles multiple simultaneous service programs per property under a single account — each with separate sq ft areas, separate waiting list entries, separate product mixes, and separate auto-scheduling intervals.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: lawn care software multiple service types, lawn care software manage multiple programs, lawn care software fertilizer pest control mosquito, lawn care multi-service software, lawn care software service types, lawn care business multiple programs software
        </div>
      </article>
    </BlogShell>
  );
}
