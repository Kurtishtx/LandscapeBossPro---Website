import BlogShell from './blog-shell';

export const metadata = {
  title: 'Lawn Care & Fertilizer Business Blog | LandscapeBossPro',
  description: 'Guides on lawn care scheduling, fertilizer program management, routing, dispatching, and growing your lawn care or pest control business.',
};

const lawnCareSchedulingPosts = [
  { title: 'How to Build Lawn Care Routes in Under 30 Minutes Every Morning', description: 'How top lawn care companies use map-based routing to build and dispatch a full day of routes before the first truck leaves the lot.', href: '/blogs/how-to-build-lawn-care-routes-fast' },
  { title: 'The Biggest Lawn Care Scheduling Mistakes Companies Make', description: 'The recurring scheduling errors that cause missed treatments, overdue accounts, and lost customers — and how to fix all of them.', href: '/blogs/lawn-care-scheduling-mistakes' },
  { title: 'How to Schedule Recurring Lawn Treatments Without Manually Booking Every Round', description: 'How auto-rescheduling works for multi-round lawn care programs so your schedule manages itself between visits.', href: '/blogs/schedule-recurring-lawn-treatments-automatically' },
  { title: 'Lawn Care Route Optimization: How to Cut Windshield Time and Fit More Stops Per Day', description: 'How to optimize drive order across a day of lawn care stops to reduce fuel costs and increase stops per route.', href: '/blogs/lawn-care-route-optimization' },
  { title: 'How to Manage Multiple Lawn Care Crews From One Scheduling Tool', description: 'How to split waiting lists, assign routes, and dispatch multiple crews simultaneously without a separate tool for each truck.', href: '/blogs/manage-multiple-lawn-care-crews' },
  { title: 'What Is a Lawn Care Waiting List and Why Your Schedule Depends on One', description: 'How a sq ft or linear ft waiting list organized by service type tells you the full scope of your day before you build a single route.', href: '/blogs/lawn-care-waiting-list' },
  { title: 'How to Track Square Footage for Every Property in Your Lawn Care Business', description: 'Why sq ft tracking is the foundation of accurate lawn care scheduling, pricing, and compliance logging.', href: '/blogs/track-square-footage-lawn-care' },
  { title: 'How to Dispatch Lawn Care Technicians Without Calling or Texting Them Every Morning', description: 'How mobile dispatch works so technicians see their route, stops, property notes, and service details on their phone.', href: '/blogs/dispatch-lawn-care-technicians' },
  { title: 'The Difference Between Lawn Care Scheduling Software and Generic Field Service Software', description: 'Why software built for recurring chemical programs handles routing, compliance, and SMS differently than job board tools.', href: '/blogs/lawn-care-scheduling-software-vs-field-service-software' },
  { title: 'How to Scale a Lawn Care Business from 50 to 500 Customers Without Hiring an Office Manager', description: 'The scheduling systems and automation that let a lawn care company scale without adding admin headcount.', href: '/blogs/scale-lawn-care-business-without-office-manager' },
  { title: 'How to Automate Customer Reminders for Every Lawn Care Visit', description: 'How day-before, on-the-way, and service complete SMS alerts fire automatically so your team never manually sends a single text.', href: '/blogs/automate-lawn-care-customer-reminders' },
  { title: 'Lawn Care Software vs. Spreadsheets: Why Spreadsheets Break After 100 Customers', description: "The exact point where spreadsheet scheduling falls apart and what a purpose-built tool handles that spreadsheets can't.", href: '/blogs/lawn-care-software-vs-spreadsheets' },
  { title: 'How to Handle Overdue Lawn Care Treatments Without Losing Customers', description: "How to identify, prioritize, and route overdue treatments before customers notice they've been skipped.", href: '/blogs/handle-overdue-lawn-care-treatments' },
  { title: 'What Lawn Care Customers Expect Before, During, and After Every Visit', description: 'The three SMS touchpoints that reduce callbacks, cancellations, and "when are you coming?" calls from customers.', href: '/blogs/what-lawn-care-customers-expect' },
  { title: 'How to Build a Weekly Lawn Care Schedule That Actually Works', description: 'A step-by-step look at how a well-structured weekly schedule keeps crews productive and customers on program all season.', href: '/blogs/weekly-lawn-care-schedule' },
  { title: 'How to Price Lawn Care Services by Square Footage', description: 'How to set per-sq-ft pricing for fertilizer, weed control, and insect programs and track revenue per stop and per route.', href: '/blogs/price-lawn-care-services-by-square-footage' },
  { title: 'Seasonal Lawn Care Scheduling: Spring, Summer, Fall, and Winterizer Programs', description: 'How to manage the full calendar of lawn care rounds across all seasons without manually scheduling anything between rounds.', href: '/blogs/seasonal-lawn-care-scheduling' },
  { title: 'How to Use Map-Based Routing to Grow a Lawn Care Route Business', description: 'How drawing circles on a map to build routes reduces scheduling time and opens up geographic expansion.', href: '/blogs/map-based-routing-lawn-care' },
  { title: 'How to Track Lawn Care Service History for Every Customer', description: 'Why a complete per-property service history log matters for compliance, customer retention, and technician training.', href: '/blogs/track-lawn-care-service-history' },
  { title: 'What to Look for in Lawn Care Scheduling Software Before You Buy', description: 'The features that actually matter for companies running recurring chemical programs — and what to skip.', href: '/blogs/what-to-look-for-lawn-care-scheduling-software' },
];

const fertilizerPosts = [
  { title: 'How to Track 5-Round and 6-Round Fertilizer Programs Without Losing Count', description: 'How fertilizer companies keep every customer on the right round at the right time across a full season of multi-round programs.', href: '/blogs/track-5-round-6-round-fertilizer-programs' },
  { title: 'Why Every Fertilizer Application Needs an EPA Registration Number in the Log', description: 'What EPA reg numbers are, why they must appear in your application records, and how field-logging software captures them automatically.', href: '/blogs/epa-registration-numbers-fertilizer-applications' },
  { title: 'How to Auto-Schedule the Next Fertilizer Round After Every Completed Visit', description: 'How auto-rescheduling works for fertilizer programs so the waiting list updates itself every time a technician completes a round.', href: '/blogs/auto-schedule-fertilizer-rounds' },
  { title: 'Fertilizer Application Rates, Area Treated, and Compliance Logging: What to Capture Per Visit', description: 'The data fields every fertilizer application record must include to satisfy state compliance requirements and pass a license inspection.', href: '/blogs/fertilizer-application-rates-compliance-logging' },
  { title: 'How to Build a Fertilizer Route Using Map-Based Routing', description: 'How to use a map view to select fertilizer stops, optimize drive order, and dispatch routes instead of building them from a list.', href: '/blogs/build-fertilizer-route-map-based-routing' },
  { title: 'How to Keep Fertilizer Compliance Records That Pass a State Inspection', description: 'What a state pesticide inspector looks for in fertilizer application records and how to make sure your logs satisfy every requirement.', href: '/blogs/lawn-care-compliance-records-fertilizer' },
  { title: 'How to Manage a Full Fertilizer Program From Round 1 to Winterizer', description: 'How to track a complete multi-round fertilizer program season — from pre-emergent through winterizer — without losing any customer or round.', href: '/blogs/manage-fertilizer-program-round-1-to-winterizer' },
  { title: 'Granular vs. Liquid Fertilizer Application Tracking: What Changes in Your Logs', description: 'How granular and liquid fertilizer applications are logged differently and why your compliance records need to reflect the actual application method.', href: '/blogs/granular-vs-liquid-fertilizer-application-tracking' },
  { title: 'How to Train Technicians to Log Fertilizer Applications Correctly in the Field', description: 'The training process that gets every tech logging complete, compliant fertilizer records from day one without a supervisor present.', href: '/blogs/train-technicians-log-fertilizer-applications' },
  { title: 'What a State Inspector Looks for in Fertilizer Application Records', description: 'The exact fields, formats, and record retention requirements a state pesticide inspector checks when auditing a lawn care company.', href: '/blogs/state-inspector-fertilizer-application-records' },
  { title: 'How to Schedule Fall Fertilizer and Winterizer Rounds Across Your Full Customer Base', description: 'How to route fall fertilizer and winterizer applications efficiently across hundreds of properties before the season window closes.', href: '/blogs/schedule-fall-fertilizer-winterizer-rounds' },
  { title: 'How to Send Re-Entry Interval Texts After Every Fertilizer Application', description: 'Why re-entry interval texts are required after chemical applications and how to fire them automatically when a technician logs a completed service.', href: '/blogs/re-entry-interval-texts-fertilizer-application' },
  { title: 'Fertilizer Software vs. Lawn Care Scheduling Tools: What\'s the Difference?', description: 'Why fertilizer-specific software handles round tracking, compliance logging, and re-entry SMS differently than general lawn care scheduling tools.', href: '/blogs/fertilizer-software-vs-lawn-care-scheduling-tools' },
  { title: 'How to Manage Commercial Fertilizer Accounts Alongside Residential Programs', description: 'The operational differences between commercial and residential fertilizer accounts and how to manage both from a single routing and compliance system.', href: '/blogs/manage-commercial-fertilizer-accounts' },
  { title: 'How to Know When Each Customer Is Due for Their Next Fertilizer Round', description: 'How fertilizer software tracks each customer\'s last service date and interval to surface the correct accounts on the waiting list exactly when they\'re due.', href: '/blogs/know-when-customer-due-fertilizer-round' },
  { title: 'Fertilizer Program Pricing: How to Charge by Square Foot and Track Revenue Per Round', description: 'How to set per-sq-ft pricing for each fertilizer round and track program revenue per customer and per route.', href: '/blogs/fertilizer-program-pricing-square-foot' },
  { title: 'Why Fertilizer Companies Need More Than a Spreadsheet for Compliance Logs', description: 'The compliance gaps that show up when fertilizer companies track application records in spreadsheets instead of structured field logs.', href: '/blogs/fertilizer-compliance-logs-vs-spreadsheets' },
  { title: 'How to Handle Overdue Fertilizer Rounds Without Losing Program Customers', description: 'How to find, prioritize, and route overdue fertilizer treatments before customers cancel their program over a missed round.', href: '/blogs/handle-overdue-fertilizer-rounds' },
  { title: 'What Is a Fertilizer Round Waiting List and How Does It Help You Route Faster?', description: "How a round-organized waiting list with sq ft totals tells you the full scope of the day's fertilizer work before you open the map.", href: '/blogs/fertilizer-round-waiting-list' },
  { title: 'How to Scale a Fertilizer Program Business Without Hiring More Office Staff', description: 'The automation and scheduling systems that let a fertilizer company grow its customer base without adding office headcount.', href: '/blogs/scale-fertilizer-program-business' },
];

const weedControlPosts = [
  { title: 'Pre-Emergent vs. Post-Emergent Weed Control: How to Schedule Both Correctly', description: 'How pre-emergent seasonal timing windows and post-emergent auto-rescheduling work differently and why they need separate scheduling logic.', href: '/blogs/pre-emergent-vs-post-emergent-weed-control-scheduling' },
  { title: 'When Should You Apply Pre-Emergent Weed Control? Timing Windows Explained', description: 'A practical guide to pre-emergent application timing, soil temperature targets, and how to manage the window across a large customer base.', href: '/blogs/when-to-apply-pre-emergent-weed-control' },
  { title: 'How to Auto-Schedule Post-Emergent Weed Control Rounds at the Right Interval', description: 'How 4-week, 6-week, and 8-week post-emergent cycles auto-reschedule on completion so your team never manually books a follow-up visit.', href: '/blogs/auto-schedule-post-emergent-weed-control' },
  { title: 'What Re-Entry Interval Should You Send Customers After Weed Control Applications?', description: 'How re-entry intervals vary by weed control product and how to capture the correct interval from the compliance log to send the right SMS.', href: '/blogs/re-entry-interval-weed-control-applications' },
  { title: 'How to Log EPA Reg Numbers for Weed Control Products in the Field', description: 'The in-field logging workflow for capturing EPA registration numbers, application rates, and conditions on every weed control application.', href: '/blogs/log-epa-reg-numbers-weed-control' },
  { title: 'How to Track Pre-Emergent and Post-Emergent Programs Separately in One System', description: 'Why pre-emergent and post-emergent rounds need separate tracking, separate compliance logs, and separate SMS templates.', href: '/blogs/track-pre-emergent-post-emergent-programs-separately' },
  { title: 'How to Build Weed Control Routes Using Circle Map Route Building', description: 'How to draw a circle on any neighborhood and pull every weed control stop due inside into an optimized route in minutes.', href: '/blogs/build-weed-control-routes-circle-map' },
  { title: 'What Compliance Records Do You Need for Weed Control Applications?', description: 'A breakdown of what state regulators require for weed control application logs and how to have every record audit-ready on demand.', href: '/blogs/compliance-records-weed-control-applications' },
  { title: 'How to Manage Broadleaf Weed Control Programs Alongside Fertilizer Rounds', description: 'How to run broadleaf, fertilizer, and pre-emergent programs under the same customer account without mixing schedules or compliance logs.', href: '/blogs/manage-broadleaf-weed-control-fertilizer-programs' },
  { title: 'How to Send Automatic Re-Entry Interval Texts After Every Weed Control Visit', description: 'How automated post-application SMS fires the correct re-entry interval based on the product logged by the technician in the field.', href: '/blogs/automatic-re-entry-interval-texts-weed-control' },
  { title: 'How to Handle Nutsedge and Specialty Weed Control Programs', description: 'How to schedule and track specialty weed treatments like nutsedge and sedge control alongside main program rounds in one waiting list.', href: '/blogs/nutsedge-specialty-weed-control-programs' },
  { title: 'Fall Pre-Emergent Scheduling: How to Hit the Right Window Across Your Entire Customer Base', description: 'The logistics of routing and completing fall pre-emergent applications before the window closes across hundreds of properties.', href: '/blogs/fall-pre-emergent-scheduling' },
  { title: 'How to Know Which Customers Are Due for Weed Control Without Checking Every Account', description: 'How a program-organized waiting list with sq ft totals shows every weed control treatment due without manual account review.', href: '/blogs/know-which-customers-due-weed-control' },
  { title: 'Weed Control Pricing by Square Foot: How to Track Revenue Per Round', description: 'How to set per-sq-ft pricing for pre-emergent and post-emergent rounds and track total program revenue per customer and per route.', href: '/blogs/weed-control-pricing-square-foot' },
  { title: 'How to Train Technicians to Log Weed Control Applications Before Leaving the Property', description: 'The field logging workflow that captures product, EPA reg number, re-entry interval, and conditions at the door on every visit.', href: '/blogs/train-technicians-log-weed-control-applications' },
  { title: 'The Biggest Weed Control Scheduling Mistakes Lawn Care Companies Make', description: 'The scheduling errors that cause missed pre-emergent windows, overdue post-emergent rounds, and lost weed control customers.', href: '/blogs/weed-control-scheduling-mistakes' },
  { title: 'Why Weed Control Companies Need Dedicated Software, Not Generic Scheduling Tools', description: 'How seasonal timing windows, compliance logging, and re-entry SMS require features that generic field service tools don\'t provide.', href: '/blogs/weed-control-software-vs-generic-scheduling-tools' },
  { title: 'How to Manage Weed Control Programs for Customers Who Also Have Fertilizer Rounds', description: 'How to schedule, route, and log weed control and fertilizer visits for the same customers without creating scheduling conflicts.', href: '/blogs/manage-weed-control-fertilizer-same-customers' },
  { title: 'What Customers Expect After a Weed Control Application', description: 'The three automated messages that tell customers the re-entry interval, when to water, and when their next visit is scheduled — sent without your team doing anything.', href: '/blogs/what-customers-expect-after-weed-control' },
  { title: 'How to Scale a Weed Control Program Without Manually Scheduling Every Round', description: 'The systems that let a weed control company grow to hundreds of program customers without adding scheduling labor between visits.', href: '/blogs/scale-weed-control-program' },
];

const pestControlPosts = [
  { title: 'How to Manage Quarterly, Bi-Monthly, and Monthly Pest Control Programs in One System', description: 'How a single platform handles different recurrence intervals, compliance logs, and SMS alerts for every program type your company runs.', href: '/blogs/manage-quarterly-bi-monthly-monthly-pest-control-programs' },
  { title: 'What Auto-Scheduling After Every Pest Control Visit Actually Looks Like', description: 'A step-by-step look at what happens after a quarterly treatment is completed and how the next visit schedules itself without anyone touching it.', href: '/blogs/auto-scheduling-pest-control-visits' },
  { title: 'How to Build Pest Control Routes Using Circle Map Route Building', description: 'How drawing a circle on any neighborhood pulls every pest control stop due inside into an optimized, dispatchable route in minutes.', href: '/blogs/build-pest-control-routes-circle-map' },
  { title: 'What EPA Compliance Records Do Pest Control Companies Need on Every Job?', description: 'The complete compliance log requirements for pest control applications and how to capture every field in a state-ready format.', href: '/blogs/epa-compliance-records-pest-control' },
  { title: 'How to Send Re-Entry Interval Texts After Every Pest Control Application Automatically', description: 'How re-entry interval SMS fires automatically based on the product and interval logged by the technician in the field.', href: '/blogs/re-entry-interval-texts-pest-control' },
  { title: 'How to Dispatch Pest Control Technicians With Everything They Need Before the First Stop', description: 'What goes into a properly dispatched pest control route and how digital dispatch eliminates the morning briefing bottleneck.', href: '/blogs/dispatch-pest-control-technicians' },
  { title: 'Quarterly vs. Bi-Monthly Pest Control: How to Manage Both Programs Without Mixing Up Due Dates', description: 'The operational differences between quarterly and bi-monthly pest control programs and how to run both from the same scheduling system.', href: '/blogs/quarterly-vs-bi-monthly-pest-control-programs' },
  { title: 'What to Do When a Pest Control Customer Is Overdue for Their Treatment', description: 'How to identify overdue pest control accounts, prioritize them in routing, and communicate with customers before the gap creates a problem.', href: '/blogs/handle-overdue-pest-control-treatments' },
  { title: 'How to See Route Revenue Before You Build the Route — Pest Control Waiting List', description: 'Why seeing expected revenue by area before committing to a route makes pest control scheduling a financial decision, not just a logistical one.', href: '/blogs/pest-control-route-revenue-waiting-list' },
  { title: 'How to Log Target Pests, Treatment Areas, and EPA Reg Numbers on Every Stop', description: 'The field logging structure that captures target pest, treatment area, and EPA registration number data on every pest control stop without slowing technicians down.', href: '/blogs/log-target-pest-treatment-areas-epa-reg-numbers' },
  { title: 'How to Add Mosquito Treatments as an Add-On for Existing Pest Control Customers', description: 'How to structure mosquito add-on programs for existing recurring customers and schedule them alongside quarterly and bi-monthly pest control without confusion.', href: '/blogs/mosquito-add-on-pest-control-customers' },
  { title: 'How to Scale a Pest Control Business on Recurring Customers, Not New Leads', description: 'Why recurring program retention and upsells generate more sustainable revenue growth than constant new customer acquisition in pest control.', href: '/blogs/scale-pest-control-business-recurring-customers' },
  { title: 'What Pest Control Customers Actually Expect From a Recurring Program', description: 'The five things recurring pest control customers consistently cite as reasons to stay or cancel — and how to deliver all five.', href: '/blogs/what-pest-control-customers-expect' },
  { title: 'How to Train Pest Control Technicians to Submit Complete Application Logs Every Time', description: 'The training approach and software structure that produces consistently complete compliance logs from every technician on every stop.', href: '/blogs/train-pest-control-technicians-application-logs' },
  { title: 'Pest Control Software vs. Generic Field Service Software: What\'s Actually Different', description: 'Why generic field service platforms fall short for pest control companies running recurring programs that require compliance logging, interval-based scheduling, and re-entry SMS.', href: '/blogs/pest-control-software-vs-field-service-software' },
  { title: 'How to Log Interior and Exterior Pest Control Treatments as Separate Records', description: 'Why interior and exterior pest control treatments need separate compliance log entries and how to structure logs when both are done in the same visit.', href: '/blogs/interior-exterior-pest-control-treatment-logs' },
  { title: 'How Monthly Pest Control Programs Create Predictable Revenue for Your Business', description: 'Why monthly pest control programs are the highest-revenue-per-customer model and how to manage 12 visits per year per account without adding scheduling staff.', href: '/blogs/monthly-pest-control-programs-predictable-revenue' },
  { title: 'How SMS Alerts Before and After Every Visit Reduce Pest Control Cancellations', description: 'The data on SMS communication and pest control cancellation rates — and how to configure pre-visit and post-visit alerts that make customers more likely to stay.', href: '/blogs/reduce-pest-control-cancellations-sms-alerts' },
  { title: 'How to Know Which Pest Control Customers Are Due Without Checking Every Account', description: 'How the waiting list in pest control scheduling software surfaces every due account automatically so dispatchers never need to manually review individual records.', href: '/blogs/know-which-pest-control-customers-due' },
  { title: 'Why Pest Control Companies Need Software Built for Recurring Programs, Not One-Time Jobs', description: 'The fundamental difference between pest control operations and one-time service trades — and why software built for generic job dispatch fails recurring program management.', href: '/blogs/pest-control-software-recurring-programs' },
];

const mosquitoControlPosts = [
  { title: 'How to Schedule Mosquito Control Treatments at the Right Seasonal Intervals', description: 'How to set up mosquito barrier spray programs that auto-reschedule at 21-day intervals so every customer stays protected all season.', href: '/blogs/schedule-mosquito-control-treatments-seasonal-intervals' },
  { title: 'How to Build Mosquito Control Routes Using Circle Map Route Building', description: 'How circle-based map routing pulls every mosquito treatment due in a neighborhood into an optimized route in minutes during peak season.', href: '/blogs/build-mosquito-control-routes-circle-map' },
  { title: 'What Re-Entry Interval Should You Send Customers After Mosquito Barrier Spray?', description: 'How re-entry intervals vary by mosquito control product and how to automatically send the right interval based on what the tech actually applied.', href: '/blogs/re-entry-interval-mosquito-barrier-spray' },
  { title: 'How to Auto-Schedule the Next Mosquito Treatment When the Previous One Is Complete', description: 'How auto-rescheduling at your set interval keeps every customer\'s program running all season without manually booking follow-up visits.', href: '/blogs/auto-schedule-mosquito-treatments' },
  { title: 'How to Log Mosquito Control Applications for EPA Compliance', description: 'The in-field compliance log workflow for mosquito barrier spray — product, EPA reg number, rate, area treated, re-entry interval, and applicator license.', href: '/blogs/log-mosquito-control-applications-epa-compliance' },
  { title: 'How to Add Mosquito Control Programs to an Existing Lawn Care or Pest Control Business', description: 'How to layer a mosquito add-on onto your existing customer base, schedule it alongside other services, and track it separately for compliance.', href: '/blogs/add-mosquito-control-programs-lawn-care-pest-control' },
  { title: 'How to Send Automated SMS Alerts for Every Mosquito Control Visit', description: 'How day-before, on-the-way, and post-application re-entry interval texts fire automatically on every mosquito visit without your team touching a phone.', href: '/blogs/automated-sms-alerts-mosquito-control' },
  { title: 'How to Manage the Mosquito Control Season From First Spray to Season Close', description: 'A seasonal playbook for managing spring startup, peak season routing, and fall close-out for a mosquito control program.', href: '/blogs/manage-mosquito-control-season' },
  { title: 'How to Price Mosquito Control Services by Linear Foot or Square Foot', description: 'How to structure per-linear-ft and per-sq-ft pricing for barrier spray programs and package pricing for seasonal programs.', href: '/blogs/price-mosquito-control-services' },
  { title: 'How to Build a Waiting List for Mosquito Control Treatments Due This Week', description: 'How a mosquito-specific waiting list shows every treatment due with stop count and route revenue before you open the map.', href: '/blogs/mosquito-control-waiting-list' },
  { title: 'How to Train Technicians to Complete Mosquito Control Application Logs in the Field', description: 'The field logging workflow that captures EPA reg number, rate, re-entry interval, and conditions at every mosquito barrier spray property.', href: '/blogs/train-technicians-mosquito-control-application-logs' },
  { title: 'How to Manage Mosquito Control Customers Who Also Have Lawn Care Programs', description: 'How to track mosquito and lawn care programs under the same customer account on separate schedules without creating routing or billing conflicts.', href: '/blogs/manage-mosquito-control-lawn-care-customers' },
  { title: 'What Customers Want to Know After Every Mosquito Barrier Spray Treatment', description: 'The automated SMS that tells customers the re-entry interval, when it\'s safe for kids and pets, and when the next treatment is scheduled.', href: '/blogs/what-customers-want-after-mosquito-barrier-spray' },
  { title: 'How to Scale a Mosquito Control Business During Peak Season Without Losing Stops', description: 'The routing, dispatch, and scheduling systems that keep a mosquito company on schedule when demand peaks in June and July.', href: '/blogs/scale-mosquito-control-business-peak-season' },
  { title: 'How to Reduce Mosquito Control Customer Cancellations With Automated Communication', description: 'Why pre-service reminders and post-service follow-up texts reduce no-access stops and mid-season cancellations on mosquito programs.', href: '/blogs/reduce-mosquito-control-cancellations' },
  { title: 'How to Track Mosquito Control Revenue by Route and Program Type', description: 'How to see daily and weekly mosquito program revenue by route and service type so you can make staffing and routing decisions based on real numbers.', href: '/blogs/track-mosquito-control-revenue' },
  { title: 'The Difference Between Mosquito Control Software and Generic Pest Control Scheduling Tools', description: 'Why mosquito barrier spray programs — with their specific intervals, re-entry SMS, and compliance logs — need more than a generic job board.', href: '/blogs/mosquito-control-software-vs-pest-control-tools' },
  { title: 'How to Handle Overdue Mosquito Control Treatments During Peak Season', description: 'How to find customers past their treatment window, route them in with active stops, and recover the treatment before the protection gap gets noticed.', href: '/blogs/handle-overdue-mosquito-control-treatments' },
  { title: 'Mosquito Control Program Pricing: How to Package and Price for Maximum Retention', description: 'How seasonal packages, per-visit pricing, and prepay discounts affect mosquito customer retention and average program revenue.', href: '/blogs/mosquito-control-program-pricing' },
  { title: 'How to Build a Mosquito Control Business That Grows Year Over Year', description: 'The program structure, customer communication, and scheduling systems that compound mosquito control business growth season after season.', href: '/blogs/build-mosquito-control-business-year-over-year' },
];

const sprayBusinessPosts = [
  { title: 'How to Run a Spray Business Without an Office Manager', description: 'The scheduling, dispatch, and communication automation that let a spray company operate efficiently without a dedicated office person managing the day.', href: '/blogs/run-spray-business-without-office-manager' },
  { title: 'How to Dispatch Spray Technicians in Under 30 Minutes Every Morning', description: 'The waiting list and circle route workflow that gets every tech dispatched with an optimized route before 8am without back-and-forth phone calls.', href: '/blogs/dispatch-spray-technicians-fast' },
  { title: 'What Software Does a Spray Business Actually Need?', description: 'A practical breakdown of what features actually matter for companies applying chemical treatments on recurring programs — and what\'s just noise.', href: '/blogs/what-software-does-a-spray-business-need' },
  { title: 'How to Build Spray Routes Using Circle Map Route Building', description: 'How circle-based route building on a live map replaces manual stop-by-stop scheduling and cuts route build time from hours to minutes.', href: '/blogs/build-spray-routes-circle-map' },
  { title: 'How to Manage Multiple Service Types From One Spray Business Platform', description: 'How to run fertilizer, weed control, pest control, and mosquito programs from one waiting list, one map, and one dispatch workflow.', href: '/blogs/manage-multiple-service-types-spray-business' },
  { title: 'How to Track Chemical Applications for Compliance Across a Spray Business', description: 'How structured in-field application logs capture EPA reg numbers, rates, and applicator license on every job in a state-ready format.', href: '/blogs/track-chemical-applications-compliance-spray-business' },
  { title: 'How to Send Automated Customer Alerts for Every Spray Service Visit', description: 'How day-before, on-the-way, and service complete texts fire automatically across every service type without your team sending a single one manually.', href: '/blogs/automated-customer-alerts-spray-service' },
  { title: 'How to Grow a Spray Business from Startup to 500 Customers', description: 'The scheduling systems, pricing structure, and customer communication workflows that support growth from first truck to multi-crew operation.', href: '/blogs/grow-spray-business-startup-to-500-customers' },
  { title: 'How to Handle Recurring Spray Programs Without Manually Scheduling Every Round', description: 'How auto-rescheduling after treatment completion keeps recurring programs running all season without your office touching anything between visits.', href: '/blogs/handle-recurring-spray-programs-auto-scheduling' },
  { title: 'How to Manage Spray Technicians in the Field Without Calling Them All Day', description: 'How mobile-first dispatch, in-field logging, and route tracking eliminate the need for office-to-field phone calls during the workday.', href: '/blogs/manage-spray-technicians-field' },
  { title: 'How to Price Spray Services by Square Foot or Linear Foot', description: 'How to structure per-sq-ft and per-linear-ft pricing for different service types and track program revenue per stop and per route.', href: '/blogs/price-spray-services-square-foot-linear-foot' },
  { title: 'How to Collect Card-on-File Payments for Recurring Spray Programs', description: 'How automatic card-on-file charging after each completed visit eliminates invoicing, collections, and end-of-month billing cycles.', href: '/blogs/card-on-file-payments-spray-programs' },
  { title: 'How to Write Estimates for Spray Services and Convert Them to Scheduled Jobs', description: 'How to build spray service estimates with per-sq-ft pricing and convert approved estimates directly into scheduled recurring programs.', href: '/blogs/spray-service-estimates-to-scheduled-jobs' },
  { title: 'How to Track Spray Business Revenue by Service Type and Route', description: 'How to see daily, weekly, and monthly revenue broken down by service type so you know which programs are driving growth.', href: '/blogs/track-spray-business-revenue' },
  { title: 'The Biggest Mistakes Spray Business Owners Make When Scaling Past 10 Trucks', description: 'The scheduling, dispatch, and compliance gaps that become expensive problems as a spray business grows beyond the owner-operator stage.', href: '/blogs/spray-business-scaling-mistakes' },
  { title: 'How to Reduce Customer Cancellations in a Spray Business With SMS Automation', description: 'Why automated pre-service communication reduces cancellations, no-access stops, and "I didn\'t know you were coming" calls.', href: '/blogs/reduce-spray-business-cancellations-sms' },
  { title: 'How Spray Business Software Pays for Itself in the First Month', description: 'A realistic look at the time savings, route efficiency gains, and reduced admin costs that make purpose-built spray software ROI-positive immediately.', href: '/blogs/spray-business-software-roi' },
  { title: 'How to Manage a Spray Business Across Multiple Crews and Service Areas', description: 'How to split waiting lists by crew, build non-overlapping routes, and dispatch multiple teams simultaneously from one platform.', href: '/blogs/manage-spray-business-multiple-crews' },
  { title: 'What to Look for in Spray Business Software Before You Sign Up', description: 'The specific features a spray company needs — waiting list, circle routing, compliance logs, SMS alerts — and how to evaluate tools against that list.', href: '/blogs/what-to-look-for-spray-business-software' },
  { title: 'How to Build a Spray Business That Runs Without You in the Field Every Day', description: 'The systems, workflows, and automation that let a spray business owner step back from day-to-day operations without losing control.', href: '/blogs/build-spray-business-runs-without-you' },
];

const pestControlSoftwarePosts = [
  { title: 'Why Pest Control Businesses Need Software Built for Recurring Treatments', description: 'Why generic field service software fails pest control companies — and what purpose-built pest control software handles differently for recurring program management.', href: '/blogs/why-pest-control-software-recurring-treatments' },
  { title: 'How Pest Control Software Tracks Remaining Treatments in a Package Plan', description: 'How package plan tracking in pest control software shows how many treatments each customer has used and how many remain — and how this drives renewal timing.', href: '/blogs/pest-control-software-track-remaining-treatments' },
  { title: 'How to Pull a Pest Control Compliance Report for a State Inspection in Under 30 Seconds', description: 'How pest control software generates a print-ready chemical application compliance report for any property, product, or date range in seconds when a state inspector arrives.', href: '/blogs/pest-control-compliance-report-state-inspection' },
  { title: 'How Pest Control Software Handles Re-Service Calls Without Disrupting the Schedule', description: 'How to manage pest control re-service calls — callback visits between scheduled treatments — without creating scheduling conflicts or missing regular program appointments.', href: '/blogs/pest-control-software-re-service-calls' },
  { title: 'How to Manage Annual Pest Control Contracts in Software', description: 'How pest control software tracks annual contract start and end dates, treatment counts, renewal timing, and billing cycles across a full book of recurring program customers.', href: '/blogs/manage-annual-pest-control-contracts-software' },
  { title: 'How Pest Control Software Automates the Full Customer Lifecycle — Estimate to Renewal', description: 'How pest control software manages every stage of the customer relationship — estimate, first service, recurring program, re-service, and renewal — without manual handoffs.', href: '/blogs/pest-control-software-estimate-to-renewal' },
  { title: 'How to Know Which Pest Control Customers Are Up for Renewal', description: 'How pest control software surfaces accounts approaching the end of their contract so renewal outreach happens before the customer lapses — not after.', href: '/blogs/know-pest-control-customers-up-for-renewal' },
  { title: 'How Pest Control Software Logs Interior and Exterior Treatments as Separate Records', description: 'Why interior and exterior pest control treatments require separate compliance log entries and how to structure logs when both are completed in the same visit.', href: '/blogs/pest-control-interior-exterior-treatment-logs' },
  { title: 'What Chemical Logs Does a State Pest Control Inspector Actually Ask For?', description: 'The specific records, fields, and formats that state pesticide inspectors request from pest control companies — and how to have every record ready before they ask.', href: '/blogs/pest-control-state-inspector-chemical-logs' },
  { title: 'How to Set Up Quarterly, Bi-Monthly, and Monthly Programs in Pest Control Software', description: 'The exact setup steps for configuring quarterly, bi-monthly, and monthly pest control programs so each interval auto-schedules correctly and tracks independently.', href: '/blogs/set-up-quarterly-bimonthly-monthly-pest-control-software' },
  { title: 'How Pest Control Software Makes Re-Entry Interval Compliance Automatic', description: 'How pest control software captures the re-entry interval from the product applied and fires the accurate REI to customers automatically — no manual lookup or SMS required.', href: '/blogs/pest-control-software-re-entry-interval-compliance' },
  { title: 'How to Build Pest Control Estimates That Convert to Recurring Programs', description: 'How to structure pest control estimates in software so accepted estimates convert directly to active recurring programs — without re-entering data or rebuilding the service schedule.', href: '/blogs/pest-control-estimates-convert-recurring-programs' },
  { title: 'How Pest Control Software Reduces the Gap Between Estimate and First Service', description: 'How fast estimate-to-service conversion in pest control software improves customer acquisition rates and why a long setup gap is the most common point of customer loss.', href: '/blogs/pest-control-software-estimate-to-first-service' },
  { title: 'How to Manage Multiple Pest Control Technicians With Software', description: 'How pest control software assigns routes, tracks completions, and manages compliance logging across multiple technicians without requiring individual coordination calls.', href: '/blogs/manage-multiple-pest-control-technicians-software' },
  { title: 'How Pest Control Software Handles Payment Collection for Recurring Programs', description: 'How card-on-file billing in pest control software collects payment after each treatment automatically — eliminating invoice cycles, collection calls, and billing gaps.', href: '/blogs/pest-control-software-payment-collection-recurring' },
  { title: 'How to Grow a Pest Control Business Without Hiring an Office Manager', description: 'The automation and systems in pest control software that let a growing operation scale account volume without adding office headcount.', href: '/blogs/grow-pest-control-business-without-office-manager' },
  { title: 'The Operational Difference Between Pest Control Software and Generic Field Service Tools', description: 'How pest control software built for recurring programs differs operationally from generic field service tools — in scheduling architecture, compliance logging, and communication.', href: '/blogs/pest-control-software-vs-generic-field-service' },
  { title: 'How Pest Control Software Manages Commercial vs. Residential Accounts', description: 'The operational differences between commercial and residential pest control accounts — and how software manages both from the same scheduling, compliance, and billing platform.', href: '/blogs/pest-control-software-commercial-vs-residential' },
  { title: 'What a Pest Control Business Looks Like at 200 Accounts vs. 500 — and the Software That Bridges the Gap', description: 'The operational changes that happen as a pest control business scales from 200 to 500 recurring accounts — and why the right software is the primary lever.', href: '/blogs/pest-control-business-200-to-500-accounts-software' },
  { title: 'How to Evaluate Pest Control Software — The Questions That Reveal Whether It\'s Built for This Industry', description: 'The specific evaluation questions that reveal whether a pest control software platform is purpose-built for recurring programs or a generic tool adapted for the industry.', href: '/blogs/evaluate-pest-control-software' },
];

const mosquitoSpraySoftwarePosts = [
  { title: 'How to Run a Mosquito Spray Business From a Single Platform', description: 'How purpose-built software handles the waiting list, circle routing, mobile dispatch, compliance logs, SMS alerts, and billing for a mosquito spray operation from one place.', href: '/blogs/run-mosquito-spray-business-single-platform' },
  { title: 'Sq Ft vs. Linear Ft Pricing for Mosquito Barrier Spray — Which Works Better?', description: 'How to choose between sq ft and linear ft pricing for barrier spray programs — and how software tracks both measurement types across your customer base.', href: '/blogs/mosquito-spray-sq-ft-vs-linear-ft-pricing' },
  { title: 'How Mosquito Spray Software Handles Seasonal Program Start and Shutdown', description: 'How to manage spring startup and fall close for a mosquito spray season in software — activating programs, communicating season start, and closing cleanly at the end.', href: '/blogs/mosquito-spray-software-seasonal-startup-shutdown' },
  { title: 'How to Build a Mosquito Spray Route Using Circle Map Routing', description: 'How circle map routing (Lasso) builds a complete mosquito barrier spray route in under 10 minutes — from drawing the circle to dispatched route with sq ft and revenue totals.', href: '/blogs/build-mosquito-spray-route-circle-map' },
  { title: 'How to Price Mosquito Barrier Spray Programs for Maximum Profitability', description: 'How to set per-treatment pricing for mosquito barrier spray programs — factoring product cost, sq ft and linear ft, labor, and drive time to build pricing that holds margin all season.', href: '/blogs/price-mosquito-barrier-spray-programs' },
  { title: 'How to Add Mosquito Spraying to an Existing Lawn Care or Pest Control Business', description: 'How lawn care and pest control companies add mosquito barrier spray as a recurring revenue service without a separate scheduling system or communication workflow.', href: '/blogs/add-mosquito-spraying-lawn-care-pest-control-business' },
  { title: 'What Equipment and Products Does a Mosquito Spray Business Actually Need?', description: 'A practical guide to barrier spray equipment and products — backpack sprayers, bifenthrin, natural alternatives — and how software tracks chemical usage across all of it.', href: '/blogs/mosquito-spray-business-equipment-products' },
  { title: 'How Mosquito Spray Software Tracks Barrier Spray Applications for EPA Compliance', description: 'How purpose-built mosquito spray software captures EPA registration numbers, application rates, and product details at each treatment for state inspection compliance.', href: '/blogs/mosquito-spray-software-barrier-spray-epa-compliance' },
  { title: 'How to Scale a Mosquito Spray Business During Peak Season Without Dropping Stops', description: 'How mosquito spray businesses handle peak-season volume — more stops due, compressed schedules, multiple crews — without losing track of overdue accounts or missing re-service alerts.', href: '/blogs/scale-mosquito-spray-business-peak-season' },
  { title: 'The Difference Between Mosquito Barrier Spray Software and Generic Scheduling Tools', description: 'Why generic field service software falls short for a mosquito spray business — and what purpose-built mosquito spray software does differently for interval scheduling, sq ft routing, and compliance.', href: '/blogs/mosquito-barrier-spray-software-vs-generic' },
  { title: 'How to Manage 21-Day Interval Mosquito Programs Without Manually Rebooking Every Visit', description: 'How automatic interval scheduling eliminates the rebooking burden for 21-day mosquito spray programs — and what happens to the waiting list at each treatment completion.', href: '/blogs/manage-21-day-interval-mosquito-programs' },
  { title: 'How Automated SMS Makes Mosquito Spray Customers Stay on Their Programs', description: 'How pre-service and post-service SMS automation reduces cancellations and keeps mosquito spray customers engaged throughout the season without manual texting from the office.', href: '/blogs/automated-sms-mosquito-spray-customer-retention' },
  { title: 'How to Handle Customer Re-Entry After Mosquito Barrier Spray — The Right Way', description: 'Why the re-entry interval matters after barrier spray, what to communicate to customers, and how automated post-service SMS delivers the message at exactly the right moment.', href: '/blogs/mosquito-spray-customer-re-entry-communication' },
  { title: 'How to Know Which Mosquito Spray Customers Are Overdue During Peak Season', description: 'How the waiting list surfaces overdue mosquito spray accounts automatically — sorted by days past due — so nothing gets dropped during the busiest weeks of peak season.', href: '/blogs/know-overdue-mosquito-spray-customers-peak-season' },
  { title: 'How to Dispatch Mosquito Spray Technicians Without Morning Phone Calls', description: 'How mobile dispatch eliminates the morning route briefing call — routes, addresses, notes, and compliance log forms delivered to mobile before technicians leave the shop.', href: '/blogs/dispatch-mosquito-spray-technicians' },
  { title: 'Mosquito Spray Business Profitability: How Much Can You Make Per Route Day?', description: 'How to calculate per-route-day revenue and margin for a mosquito spray business — and how software shows revenue totals before dispatch so you know what each day generates.', href: '/blogs/mosquito-spray-business-profitability-per-route-day' },
  { title: 'How to Close the Season for a Mosquito Spray Business — Last Treatments and Customer Communication', description: 'How to wrap up a mosquito spray season — completing last treatments, communicating season-end to customers, and setting up renewal before the off-season starts.', href: '/blogs/close-mosquito-spray-season-last-treatments' },
  { title: 'How Mosquito Spray Software Handles Linear Foot Measurements for Barrier Spray', description: 'How linear ft measurements are stored per property, used for pricing, displayed on the waiting list, and tracked in the chemical compliance report for perimeter barrier spray.', href: '/blogs/mosquito-spray-software-linear-foot-measurements' },
  { title: 'How to Grow a Mosquito Spray Business From Add-On Service to Primary Revenue', description: 'How mosquito spray shifts from a secondary service offering to the primary revenue driver — what changes operationally, how software scales with the volume, and what makes the transition sustainable.', href: '/blogs/grow-mosquito-spray-business-primary-revenue' },
  { title: 'What Makes a Mosquito Spray Business Different from Other Pest Control Companies', description: 'How mosquito spray businesses differ from general pest control in service model, measurement, interval scheduling, product chemistry, seasonal structure, and software requirements.', href: '/blogs/mosquito-spray-business-vs-other-pest-control' },
];

const lawnCareSoftwarePosts = [
  { title: 'What Is Lawn Care Software and Does Your Business Actually Need It?', description: 'A plain-language breakdown of what lawn care software does, what problems it solves, and at what point a lawn care business genuinely needs it.', href: '/blogs/what-is-lawn-care-software' },
  { title: 'How Lawn Care Software Replaces Spreadsheets, Paper Routes, and Phone Calls', description: 'A function-by-function comparison of what spreadsheets and paper systems do vs. what purpose-built lawn care software replaces them with.', href: '/blogs/lawn-care-software-replaces-spreadsheets' },
  { title: 'How to Use Lawn Care Software to Manage Your Waiting List Every Morning', description: 'How the waiting list in lawn care software works as the daily operational hub — showing every due account, sq ft, and revenue before you build a single route.', href: '/blogs/lawn-care-software-waiting-list' },
  { title: 'What the Best Lawn Care Software Does That Generic Tools Don\'t', description: 'The specific capabilities that separate purpose-built lawn care software from generic field service tools adapted for lawn care use.', href: '/blogs/best-lawn-care-software-vs-generic' },
  { title: 'How Lawn Care Software Handles Chemical Application Compliance Automatically', description: 'How purpose-built lawn care software captures every required compliance field at the property and makes records available for inspection in seconds.', href: '/blogs/lawn-care-software-chemical-compliance' },
  { title: 'How to Set Up a New Lawn Care Customer in Software and Start the First Program', description: 'The exact steps to add a new lawn care customer in software — client, property, sq ft areas, package plan, and first service — so they appear on the waiting list automatically.', href: '/blogs/set-up-lawn-care-customer-software' },
  { title: 'How Lawn Care Software Calculates Route Revenue Before You Build the Route', description: 'How the waiting list total in lawn care software shows expected revenue for due accounts before any routing begins — and why that matters for daily production planning.', href: '/blogs/lawn-care-software-route-revenue' },
  { title: 'How to Manage Client Notes and Property Details in Lawn Care Software', description: 'How lawn care software stores property notes, access instructions, and service details so every technician has the right information before arriving at the stop.', href: '/blogs/lawn-care-software-client-notes-property-details' },
  { title: 'How Lawn Care Software Reduces the Time You Spend on Scheduling Every Week', description: 'The scheduling time that lawn care software eliminates across the weekly workflow — from morning dispatch to customer rebooking to end-of-day auto-scheduling.', href: '/blogs/lawn-care-software-reduce-scheduling-time' },
  { title: 'How to Track Every Chemical Application Your Business Makes With Lawn Care Software', description: 'How lawn care software records every pesticide and fertilizer application in a searchable database — and how to generate a chemical usage report for any date range.', href: '/blogs/track-chemical-applications-lawn-care-software' },
  { title: 'How Lawn Care Software Sends Customer Notifications Without Your Team Doing Anything', description: 'How automated SMS alerts in lawn care software fire at every customer touchpoint — dispatch, completion, payment declined — without any manual action from the office team.', href: '/blogs/lawn-care-software-customer-notifications' },
  { title: 'How to Grow a Lawn Care Business From 50 to 300 Customers Using Software', description: 'The operational changes that software makes possible as a lawn care business scales from 50 recurring accounts to 300 — and why manual systems fail before you get there.', href: '/blogs/grow-lawn-care-business-50-to-300' },
  { title: 'The Features Every Lawn Care Software Needs (And Most Are Missing)', description: 'A checklist of the features that a lawn care business actually needs in software — and which ones are commonly missing from platforms not built specifically for the industry.', href: '/blogs/lawn-care-software-features' },
  { title: 'How Lawn Care Software Handles Multiple Service Types Under One Account', description: 'How lawn care software manages fertilizer, weed control, pest control, mosquito, and flower bed services for the same customer under a single account.', href: '/blogs/lawn-care-software-multiple-service-types' },
  { title: 'How to Dispatch Lawn Care Crews With Software Instead of Phone Calls', description: 'How digital dispatch in lawn care software sends routes, property notes, and field log forms to technicians without a single phone call from the office.', href: '/blogs/dispatch-lawn-care-crews-software' },
  { title: 'How to Know Your Route Revenue Before You Leave the Parking Lot', description: 'How lawn care software makes route revenue visible before dispatch so the team can plan production targets and adjust before trucks leave.', href: '/blogs/know-route-revenue-before-dispatch' },
  { title: 'Lawn Care Software Pricing: What You Should Expect to Pay and What You Get', description: 'A plain breakdown of lawn care software pricing models — per-user, per-account, per-feature, and flat monthly — and what each means for a growing lawn care business.', href: '/blogs/lawn-care-software-pricing' },
  { title: 'How Lawn Care Software Pays for Itself in the First 90 Days', description: 'The specific time savings, missed-service recovery, and route efficiency gains that add up to a positive ROI on lawn care software within the first season.', href: '/blogs/lawn-care-software-roi-90-days' },
  { title: 'How to Evaluate Lawn Care Software Before You Sign Up', description: 'A practical evaluation process for lawn care software — what to demo, what to test in a trial, and the questions that reveal whether a platform is actually built for lawn care.', href: '/blogs/evaluate-lawn-care-software' },
  { title: 'How to Transition a Lawn Care Business From Spreadsheets to Software', description: 'A practical transition plan for moving a lawn care operation from spreadsheets to purpose-built software — without disrupting an active season or losing track of any accounts.', href: '/blogs/transition-lawn-care-business-spreadsheets-to-software' },
];

export default function BlogIndexPage() {
  return (
    <BlogShell>
      <div className="blog-index">
        <h1>Lawn Care &amp; Fertilizer Business Blog</h1>
        <p className="blog-index-sub">Guides on scheduling, routing, fertilizer program management, and growing a lawn care or pest control business.</p>

        <h2 className="blog-index-silo-title">Lawn Care Scheduling</h2>
        <div className="blog-index-grid">
          {lawnCareSchedulingPosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Fertilizer Software</h2>
        <div className="blog-index-grid">
          {fertilizerPosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Weed Control Software</h2>
        <div className="blog-index-grid">
          {weedControlPosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Pest Control Scheduling Software</h2>
        <div className="blog-index-grid">
          {pestControlPosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Mosquito Control Software</h2>
        <div className="blog-index-grid">
          {mosquitoControlPosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Spray Business Software</h2>
        <div className="blog-index-grid">
          {sprayBusinessPosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Pest Control Software</h2>
        <div className="blog-index-grid">
          {pestControlSoftwarePosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Mosquito Spray Software</h2>
        <div className="blog-index-grid">
          {mosquitoSpraySoftwarePosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>

        <h2 className="blog-index-silo-title">Lawn Care Software</h2>
        <div className="blog-index-grid">
          {lawnCareSoftwarePosts.map((post) => (
            <a key={post.href} href={post.href} className="blog-index-card">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
            </a>
          ))}
        </div>
      </div>
    </BlogShell>
  );
}
