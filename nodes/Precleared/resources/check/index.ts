import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { simplifyCheck, throwOnApiError } from '../../shared/hooks';

const showForCheck = {
	resource: ['check'],
	operation: ['checkRecipient'],
};

// The eight countries Precleared has rules for. Use an expression to send any
// other two-letter code; the check then says it has no rule for that country.
const countryOptions: INodePropertyOptions[] = [
	{ name: 'Australia', value: 'AU' },
	{ name: 'Canada', value: 'CA' },
	{ name: 'France', value: 'FR' },
	{ name: 'Germany', value: 'DE' },
	{ name: 'Ireland', value: 'IE' },
	{ name: 'Netherlands', value: 'NL' },
	{ name: 'United Kingdom', value: 'GB' },
	{ name: 'United States', value: 'US' },
];

export const checkDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['check'],
			},
		},
		options: [
			{
				name: 'Check Recipient',
				value: 'checkRecipient',
				action: 'Check a recipient',
				description:
					'Check whether a cold or marketing email may be sent to one recipient. Nothing is sent to them.',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/check',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [throwOnApiError, simplifyCheck],
					},
				},
			},
		],
		default: 'checkRecipient',
	},
	{
		displayName: 'Check By',
		name: 'checkBy',
		type: 'options',
		options: [
			{
				name: 'Email Address',
				value: 'email',
				description: 'Check one address',
			},
			{
				name: 'Domain',
				value: 'domain',
				description: 'Check a company domain when you have no address yet',
			},
		],
		default: 'email',
		displayOptions: {
			show: showForCheck,
		},
	},
	{
		displayName: 'Email',
		name: 'recipientEmail',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		required: true,
		description: 'The address you want to send a cold or marketing email to',
		displayOptions: {
			show: {
				...showForCheck,
				checkBy: ['email'],
			},
		},
		routing: {
			send: {
				type: 'body',
				property: 'recipient_email',
			},
		},
	},
	{
		displayName: 'Domain',
		name: 'recipientDomain',
		type: 'string',
		placeholder: 'example.com',
		default: '',
		required: true,
		description: "The recipient's company domain",
		displayOptions: {
			show: {
				...showForCheck,
				checkBy: ['domain'],
			},
		},
		routing: {
			send: {
				type: 'body',
				property: 'recipient_domain',
			},
		},
	},
	{
		displayName: 'Address Source',
		name: 'addressSource',
		type: 'options',
		options: [
			{
				name: 'Bought',
				value: 'bought',
				description: 'From a purchased list',
			},
			{
				name: 'Given',
				value: 'given',
				description: 'The person gave it to you',
			},
			{
				name: 'Published',
				value: 'published',
				description: 'On their website, a profile or a directory',
			},
			{
				name: 'Scraped',
				value: 'scraped',
				description: 'Collected by a tool',
			},
			{
				name: 'Unknown',
				value: 'unknown',
				description: 'You are not sure where it came from',
			},
		],
		default: 'unknown',
		required: true,
		description: "Where the address came from. It changes the verdict, so don't assume Published.",
		displayOptions: {
			show: showForCheck,
		},
		routing: {
			send: {
				type: 'body',
				property: 'address_source',
			},
		},
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: showForCheck,
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showForCheck,
		},
		options: [
			{
				displayName: 'Company Number',
				name: 'companyNumber',
				type: 'string',
				default: '',
				placeholder: '01234567',
				description:
					'UK Companies House number, if you have it, so the register can confirm the company',
				routing: {
					send: {
						type: 'body',
						property: 'company_number',
					},
				},
			},
			{
				displayName: 'Existing Customer',
				name: 'existingCustomer',
				type: 'boolean',
				default: false,
				description: 'Whether the recipient has bought from you before',
				routing: {
					send: {
						type: 'body',
						property: 'existing_customer',
					},
				},
			},
			{
				displayName: 'Fallback Recipient Country',
				name: 'defaultRecipientCountry',
				type: 'options',
				options: countryOptions,
				default: 'GB',
				description:
					"Country to use only when the recipient's country can't be worked out. Recipient Country always wins.",
				routing: {
					send: {
						type: 'body',
						property: 'default_recipient_country',
					},
				},
			},
			{
				displayName: 'On Do-Not-Contact List',
				name: 'suppressed',
				type: 'boolean',
				default: false,
				description:
					'Whether the recipient is on your own suppression or do-not-contact list. Precleared does not keep one for you.',
				routing: {
					send: {
						type: 'body',
						property: 'suppressed',
					},
				},
			},
			{
				displayName: 'Pitch',
				name: 'pitch',
				type: 'string',
				default: '',
				placeholder: 'Bookkeeping software for dental practices',
				description:
					"What the email offers, in a few words. Used to judge relevance to the recipient's role.",
				routing: {
					send: {
						type: 'body',
						property: 'pitch',
					},
				},
			},
			{
				displayName: 'Pitch Relevant to Role',
				name: 'pitchRelevant',
				type: 'boolean',
				default: true,
				description: "Whether the offer relates to the recipient's job or business",
				routing: {
					send: {
						type: 'body',
						property: 'pitch_relevant',
					},
				},
			},
			{
				displayName: 'Recipient Country',
				name: 'recipientCountry',
				type: 'options',
				options: countryOptions,
				default: 'GB',
				description:
					"The recipient's country, if you know it. Otherwise it is worked out from the domain, the company register and the company's website.",
				routing: {
					send: {
						type: 'body',
						property: 'recipient_country',
					},
				},
			},
			{
				displayName: 'Sender Country',
				name: 'senderCountry',
				type: 'options',
				options: [
					{ name: 'United Kingdom', value: 'GB' },
					{ name: 'United States', value: 'US' },
				],
				default: 'GB',
				description: 'Where your business is based. Not the recipient.',
				routing: {
					send: {
						type: 'body',
						property: 'sender_country',
					},
				},
			},
		],
	},
];
