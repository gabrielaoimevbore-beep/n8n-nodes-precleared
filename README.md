# n8n-nodes-precleared

This is an n8n community node for [Precleared](https://precleared.dev). It checks whether a cold or marketing email may be sent to a recipient before you send it. Each check returns a verdict, the rule that decided it with its legal source, what the email's footer must include, a next step and a signed receipt.

Precleared covers the UK (PECR and UK GDPR), the US (CAN-SPAM), Canada (CASL), Germany, France, Australia, Ireland and the Netherlands. Nothing is sent to the recipient.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Usage](#usage) · [Resources](#resources) · [Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The package name is `n8n-nodes-precleared`.

## Operations

**Check**

- **Check Recipient**: one check for one email address, or for a company domain when you have no address yet. The verdict is one of:
  - `ok_to_email`: send, with a footer that meets `footer_text`
  - `consent_needed`: don't send a cold email; follow `next_step`
  - `blocked`: don't send; follow `next_step`
  - `unknown`: a fact could not be established. Treat it as `consent_needed` unless you can supply the missing fact, for example the recipient's country.

**Key**

- **Get Usage**: today's free checks left and the pack credits on your key. It doesn't use a check.

**Receipt**

- **Get**: the signed record of an earlier check, by receipt ID or receipt page link: verdict, rules applied, masked recipient, time, hashes, signature and public key.

## Credentials

1. Get a free API key at [precleared.dev/get-key](https://precleared.dev/get-key). No card is needed. A new key gets 14 days at 100 checks a day, then 25 a day free. For more, £15 a month keeps 100 a day, or a pack adds 2,000 checks for £39 and never expires.
2. In n8n, create a **Precleared API** credential and paste the key. It starts with `pc_live_`.
3. n8n tests the key against `GET /api/v1/key`, which doesn't use a check.

## Compatibility

Built with `@n8n/node-cli` 0.52.6 and tested with n8n 2.43.8.

## Usage

**A typical workflow:** a lead source (Google Sheets, Apollo, a CSV) feeds **Precleared: Check Recipient**, then an **If** node that continues only when `is_ok_to_email` is true, then your send step (Gmail, Instantly, Smartlead, lemlist).

**Address Source changes the verdict.** Choose where the address came from: Published (their website, a profile or a directory), Bought, Scraped, Given, or Unknown. Don't assume Published.

**Simplify** is on by default and returns one flat item with these fields: `verdict`, `is_ok_to_email`, `confidence`, `rule`, `rule_key`, `source_title`, `source_url`, `notes`, `footer_text`, `next_step`, `recipient_country`, `legal_form`, `company_name`, `receipt_id`, `receipt_url`, `free_remaining_today`, `credits_remaining`, `usage_notice` and `disclaimer`. Turn it off to get the full response.

**AI Agent.** The node can be used as a tool by n8n's AI Agent. Tell the agent to run a check for every new recipient before the first email and to follow the verdict.

**Errors.**

- When today's free checks are used and the key has no pack credits, the node stops with a message that includes the key's own buy link.
- Each key is limited to 60 checks a minute.
- Use the node's **On Error** setting if you want a workflow to carry on past a failed check.

**Receipts.** Keep `receipt_id` with the lead. `https://precleared.dev/r/<receipt_id>` shows the receipt, and **Receipt: Get** fetches the signed record if a client or regulator asks what was checked.

Precleared gives decision support with sources. It is not legal advice.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Precleared documentation](https://precleared.dev/docs)
- [Get a free API key](https://precleared.dev/get-key)

## Version history

- **0.1.2**: the codex file names the node in full (`n8n-nodes-precleared.precleared`), as n8n's review asked. The node itself is unchanged.
- **0.1.1**: first version on npm, with Check Recipient, Get Usage and Get Receipt. (0.1.0 was tagged on GitHub but not published.)
