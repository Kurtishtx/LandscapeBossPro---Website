import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Automated SMS Alerts for Mosquito Control Visits | LandscapeBossPro',
  description: 'How day-before, on-the-way, and post-application re-entry interval texts fire automatically on every mosquito visit without your team touching a phone.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">LandscapeBossPro Blog &mdash; Customer Communication</p>
        <h1>How to Send Automated SMS Alerts for Every Mosquito Control Visit</h1>

        <p>A mosquito control company making 200 treatments per week during peak season is generating 600 customer communication touchpoints per week if it sends three messages per visit — day-before, on-the-way, and post-service. No team has the bandwidth to send 600 messages per week manually. The entire customer communication system needs to run automatically, triggered by dispatch actions and field log submissions, with service-specific language that tells mosquito customers exactly what to expect before, during, and after every treatment.</p>

        <h2>Alert 1: Day-Before Reminder</h2>
        <p>The day-before mosquito reminder fires 24 hours before the scheduled treatment and accomplishes three things: it tells the customer their treatment is scheduled for tomorrow, it asks them to ensure yard access (gates unlocked, dogs inside, furniture moved away from treatment areas), and it sets expectations about the re-entry interval they&apos;ll need to observe after the application. A reminder that says &quot;Your mosquito barrier spray is scheduled for tomorrow. Please ensure gates are unlocked and pets are inside during the treatment. After application, please keep pets and children out of treated areas for approximately 1 hour while the product dries.&quot; gives the customer everything they need to prepare — before the technician arrives.</p>

        <h2>Alert 2: On-the-Way Notification</h2>
        <p>The on-the-way notification fires when the technician marks the mosquito stop as &quot;next&quot; or checks in as in transit. It tells the customer the technician is approximately X minutes away. For mosquito customers who are home and need to bring pets inside or unlock a gate, this 10 to 20 minute advance notice is the difference between a smooth access experience and a technician waiting at a locked gate. In purpose-built <a href="/mosquito-control-software">mosquito control software</a>, this notification fires from the technician&apos;s mobile route progress update — no office action required.</p>

        <h2>Alert 3: Post-Service Confirmation With REI and Next Visit</h2>
        <p>The post-service confirmation is the most important message in the mosquito control communication sequence. It fires when the technician submits the compliance log and marks the stop complete. It includes:</p>
        <ul>
          <li>Confirmation that the mosquito barrier spray was completed</li>
          <li>The re-entry interval for the specific product applied — pulled from the compliance log, not a static template</li>
          <li>Specific language about children and pets (&quot;Please keep pets and children out of treated yard areas for [REI] while the product dries&quot;)</li>
          <li>The estimated date of the next treatment (&quot;Your next mosquito treatment is estimated for [Date + 21 days]&quot;)</li>
        </ul>
        <p>This message answers every question the customer might otherwise call the office to ask — and it arrives before they&apos;ve had a chance to wonder whether the technician actually completed the service.</p>

        <h2>Service-Specific Language for Mosquito Programs</h2>
        <p>Mosquito SMS templates should be configured specifically for mosquito service — not shared with lawn care or pest control templates. A customer receiving &quot;Your lawn care service is complete&quot; after a mosquito treatment is receiving inaccurate information. A message that says &quot;Your mosquito barrier spray is complete&quot; with the correct re-entry instructions for outdoor chemical applications (not indoor pest control REI language) is accurate and professional. Service-type SMS templates configured in the software fire the right language for each service type automatically — no manual selection needed at dispatch time.</p>

        <p>For how the mosquito program add-on fits alongside other services with their own separate SMS templates, see <a href="/blogs/add-mosquito-control-programs-lawn-care-pest-control">How to Add Mosquito Control Programs to an Existing Lawn Care or Pest Control Business</a>.</p>

        <div className="blog-cta-box">
          <h3>Day-before, on-the-way, post-service with product-specific REI. Three automatic messages per mosquito visit.</h3>
          <p>LandscapeBossPro fires all three mosquito control customer alerts automatically — day-before from dispatch, on-the-way from route transit, and post-service with the actual REI from the compliance log — without your team sending a single message manually.</p>
          <a href="https://my.landscapebosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: automated SMS alerts mosquito control, mosquito control customer texts, automated mosquito service notifications, mosquito barrier spray SMS, mosquito treatment customer communication, automated mosquito control alerts
        </div>
      </article>
    </BlogShell>
  );
}
