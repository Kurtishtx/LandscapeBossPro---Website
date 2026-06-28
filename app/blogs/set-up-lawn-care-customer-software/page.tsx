import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Set Up a New Lawn Care Customer in Software | LandscapeBossPro',
  description: 'The exact steps to add a new lawn care customer in software — client, property, sq ft areas, package plan, and first service — so they appear on the waiting list automatically.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Lawn Care Software</p>
        <h1>How to Set Up a New Lawn Care Customer in Software and Start the First Program</h1>

        <p>The way a lawn care business sets up new customers in software determines whether those customers ever miss a service. A customer entered correctly — with a client record, a property with the right sq ft measurements, a package plan that defines their program, and a first service on the waiting list — will never fall through the cracks. A customer entered in a shortcut manner — skipping the sq ft, not attaching a package, not creating the first service — generates a record that produces no output. The dispatcher won&apos;t see them on the waiting list. They won&apos;t appear in the sq ft totals. Their revenue won&apos;t factor into the daily route planning. Doing it right the first time is faster than correcting it later.</p>

        <h2>Step 1: Create the Client Record</h2>
        <p>The client record is the billing identity — the person or company responsible for payment. Add their name, phone number, billing address, and email. In <a href="/lawn-care-software">lawn care software</a>, clients can have multiple properties, so the client record is the parent that ties multiple service addresses together under one billing account. If a customer has a home lawn and a commercial property, both are service addresses linked to the same client.</p>

        <h2>Step 2: Add the Service Property</h2>
        <p>The property is the service address — where the technician goes and where the treatment happens. On the property record, enter the service address and attach it to the master client created in step 1. The property also stores office notes (gate codes, dog in yard, access instructions) that dispatch with every route so the technician sees them before arriving.</p>

        <h2>Step 3: Enter the Area Treated Sq Ft</h2>
        <p>The Area Treated tab on the property record is where sq ft gets entered by service type: Lawn Sq Ft, Lawn Insect Sq Ft, Flower Bed(s) Sq Ft, Mosquito Control Sq Ft, Pest Control Sq Ft. These numbers drive the waiting list totals. A property without sq ft data doesn&apos;t contribute to the daily sq ft tally — which means the dispatcher can&apos;t use the waiting list to assess route capacity for that customer. Enter the correct measurements during setup and they&apos;re used automatically for every service going forward.</p>

        <h2>Step 4: Assign a Package Plan</h2>
        <p>Package plans define the program — the list of services (Round 1 fertilizer, Round 2, weed control, pest control, etc.), the default pricing for each, and the interval between treatments. When a package plan is assigned to a property, it creates the initial set of services in the waiting list automatically. The customer immediately exists as a real account in the system with defined service expectations, not just a name in a list.</p>

        <h2>Step 5: Create the First Service</h2>
        <p>After the package is assigned, the first service should be scheduled — either immediately for today&apos;s or tomorrow&apos;s route, or set with a target date. From that first completion forward, auto-scheduling takes over. The system calculates the next due date from the completion date at the configured program interval and surfaces it in the waiting list without any additional action.</p>

        <p>For how the waiting list uses the sq ft and service data entered during setup to drive daily operations, see <a href="/blogs/lawn-care-software-chemical-compliance">How Lawn Care Software Handles Chemical Application Compliance Automatically</a>.</p>

        <div className="blog-cta-box">
          <h3>Client. Property. Sq ft by service type. Package plan. First service. Five steps to a customer who never falls through the cracks.</h3>
          <p>LandscapeBossPro&apos;s new customer setup flow creates a complete, active account in under 10 minutes — with sq ft data, package services, and automatic waiting list placement from the first completion forward.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: set up lawn care customer software, add new lawn care customer software, lawn care software customer setup, lawn care software onboarding customer, lawn care software new account setup, lawn care property setup software
        </div>
      </article>
    </BlogShell>
  );
}
