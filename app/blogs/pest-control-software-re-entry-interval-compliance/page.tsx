import BlogShell from '../blog-shell';

export const metadata = {
  title: 'Pest Control Re-Entry Interval Compliance | SprayBossPro',
  description: 'How pest control software captures the re-entry interval from the product applied and fires the accurate REI to customers automatically — no manual lookup or SMS required.',
};

export default function Page() {
  return (
    <BlogShell>
      <article className="blog-article">
        <p className="blog-meta">SprayBossPro Blog &mdash; Pest Control Software</p>
        <h1>How Pest Control Software Makes Re-Entry Interval Compliance Automatic</h1>

        <p>Re-entry intervals are a legally required communication to pest control customers after every pesticide application — the period during which people and pets should avoid treated areas to allow the product to dry and reduce exposure risk. The requirement isn&apos;t that the company should communicate the REI when convenient or when a customer asks. The requirement is that customers must be informed after every application, with the accurate REI for the specific product applied. The &quot;specific product applied&quot; part is where manual REI communication fails: a technician who applies product A at one property and product B at the next property has two different REIs to communicate, and if the post-service text is a template that says &quot;please stay off treated areas for 30 minutes,&quot; that generic message may be accurate for product A but incorrect for product B. Purpose-built <a href="/pest-control-software">pest control software</a> eliminates this risk by pulling the REI from the product record for what was actually applied and including it in the automated post-service SMS automatically.</p>

        <h2>How the REI Gets Into the System</h2>
        <p>Each product in the software&apos;s product library has a re-entry interval field that is set when the product is added. For granular, liquid residual, and gel bait products, this might be 30 minutes, 4 hours, or &quot;when dry&quot; — whatever the label specifies. When a product mix is created that combines multiple products, the product mix record uses the longest REI among the combined products for the SMS (the most conservative correct value). This setup is a one-time configuration per product. After that, every application of that product carries the correct REI automatically.</p>

        <h2>How the REI Fires After Every Completion</h2>
        <p>When the technician submits the field completion log and selects the products applied, the software has everything it needs to send the post-service SMS with the accurate REI. The completion log submission triggers the automated completion alert, which includes the REI from the product record in the message text. The customer receives something like: &quot;Your pest control service at [address] is complete. Please allow [X hours] before people and pets re-enter treated areas. Your next visit is scheduled for approximately [date].&quot; The REI in the message is accurate to what was applied that day — not a generic placeholder.</p>

        <h2>Different Products, Different REIs, Same Visit</h2>
        <p>When a technician applies multiple products in a single visit — exterior residual spray with a 4-hour REI and interior gel bait with a 30-minute REI — the software uses the longer REI (4 hours) in the customer SMS, which is the most conservative and label-compliant approach. The compliance log records both products with their individual REIs so the inspector can verify accurate documentation of each, while the customer communication reflects the practical guidance they need for safely re-entering the home.</p>

        <h2>REI Documentation in Compliance Records</h2>
        <p>The re-entry interval is a required field in many state pesticide application records. Because the REI is captured from the product library at logging time, it appears in the compliance record for every application automatically — not as a field the technician entered from memory, but as a pre-filled value tied to the documented product. This means the compliance record and the customer SMS always reflect the same REI, which is the REI specified on the label for the product used.</p>

        <p>For how program setup determines which products are logged on each service type, see <a href="/blogs/set-up-quarterly-bimonthly-monthly-pest-control-software">How to Set Up Quarterly, Bi-Monthly, and Monthly Programs in Pest Control Software</a>.</p>

        <div className="blog-cta-box">
          <h3>Product applied. REI from the label. Customer SMS sent. Compliance record filed. Zero manual steps.</h3>
          <p>SprayBossPro sends the accurate re-entry interval from the product library record automatically with every post-service SMS — so REI communication is always correct and always compliant without any manual intervention.</p>
          <a href="https://my.spraybosspro.com">Start Free Trial</a>
        </div>

        <div className="blog-keywords">
          Keywords: pest control re-entry interval compliance software, pest control software REI automatic, pest control re-entry interval SMS, pest control software automatic re-entry interval, pest control REI customer notification, pest control software re-entry compliance
        </div>
      </article>
    </BlogShell>
  );
}
