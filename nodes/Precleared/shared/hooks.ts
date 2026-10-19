import {
	NodeApiError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type JsonObject,
} from 'n8n-workflow';

const RECEIPT_ID = /cc_rcpt_[0-9A-Z]{16}/;

function asObject(value: unknown): IDataObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as IDataObject) : {};
}

function asText(value: unknown): string | null {
	return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/**
 * Precleared answers errors with JSON such as { error, message, buy_url }.
 * Requests are sent with ignoreHttpStatusErrors so this hook can turn each
 * error into a message that says what to do next. The message carries anything
 * an AI Agent needs to pass on (such as the buy link), because tools often
 * return only the message, not the description.
 */
export async function throwOnApiError(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const status = response.statusCode;
	if (status < 400) {
		return items;
	}

	const body = asObject(response.body);
	const apiMessage = asText(body.message) ?? asText(body.error) ?? '';
	let message: string;
	let description: string;

	if (status === 400) {
		message = `Precleared rejected the request: ${apiMessage || 'check the fields and try again.'}`;
		description = 'Give an email address or a domain, and two-letter country codes such as GB or US.';
	} else if (status === 401) {
		message =
			'Precleared did not accept the API key. Get a free key at https://precleared.dev/get-key';
		description = 'The key is wrong or has been revoked. Update the Precleared credential with a current key.';
	} else if (status === 402) {
		const buyUrl = asText(body.buy_url) ?? 'https://precleared.dev/buy';
		message = `Today's free checks are used and this key has no pack credits left. Buy a pack at ${buyUrl}`;
		description =
			'A pack is 2,000 checks for £39 and never expires. You can turn on auto top-up at the same link so the key does not run out again. Free checks come back at midnight UK time.';
	} else if (status === 404) {
		message = 'Precleared found no receipt with that ID';
		description = 'Receipt IDs look like cc_rcpt_ followed by 16 capital letters and numbers.';
	} else if (status === 429) {
		const retryAfter = typeof body.retry_after === 'number' ? body.retry_after : 60;
		message = `Precleared rate limit reached. Try again in ${retryAfter} seconds.`;
		description = apiMessage || 'Each key allows 60 checks a minute.';
	} else if (status >= 500) {
		message = 'Precleared could not complete the request. Try again in a minute or two.';
		description = apiMessage;
	} else {
		message = `Precleared answered with status ${status}`;
		description = apiMessage;
	}

	throw new NodeApiError(this.getNode(), body as JsonObject, {
		message,
		description,
		httpCode: String(status),
	});
}

/**
 * With "Simplify" on, a check comes back as one flat item with the fields most
 * workflows and AI agents need. With it off, the full response is returned.
 */
export async function simplifyCheck(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const simplify = this.getNodeParameter('simplify', true) as boolean;
	if (!simplify) {
		return items;
	}

	return items.map((item) => {
		const json = item.json;
		const reasons = Array.isArray(json.reasons) ? (json.reasons as IDataObject[]) : [];
		const rule = reasons.find((reason) => typeof asObject(reason).rule_key === 'string') ?? {};
		const notes = reasons
			.map((reason) => asText(asObject(reason).note))
			.filter((note): note is string => note !== null);
		const facts = asObject(json.facts);
		const receipt = asObject(json.receipt);
		const usage = asObject(json.usage);
		const receiptId = asText(receipt.id);

		return {
			json: {
				verdict: json.verdict ?? null,
				is_ok_to_email: json.verdict === 'ok_to_email',
				confidence: json.confidence ?? null,
				rule: rule.text ?? null,
				rule_key: rule.rule_key ?? null,
				source_title: rule.source_title ?? null,
				source_url: rule.source_url ?? null,
				notes: notes.length > 0 ? notes.join(' ') : null,
				footer_text: json.footer_text ?? null,
				next_step: json.next_step ?? null,
				recipient_country: facts.recipient_country ?? null,
				legal_form: facts.legal_form ?? null,
				company_name: facts.company_name ?? null,
				receipt_id: receiptId,
				receipt_url: receiptId ? `https://precleared.dev/r/${receiptId}` : null,
				free_remaining_today: usage.free_remaining_today ?? null,
				credits_remaining: usage.credits_remaining ?? null,
				usage_notice: usage.notice ?? null,
				disclaimer: json.disclaimer ?? null,
			},
			pairedItem: item.pairedItem,
		};
	});
}

/** Accept a bare receipt ID or a link to a receipt page, and send just the ID. */
export async function setReceiptId(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const raw = String(this.getNodeParameter('receiptId', '')).trim();
	const match = raw.match(RECEIPT_ID);
	requestOptions.qs = { ...(requestOptions.qs ?? {}), id: match ? match[0] : raw };
	return requestOptions;
}
