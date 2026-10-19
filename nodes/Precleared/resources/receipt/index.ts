import type { INodeProperties } from 'n8n-workflow';
import { setReceiptId, throwOnApiError } from '../../shared/hooks';

export const receiptDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['receipt'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a receipt',
				description:
					'Get the signed record of an earlier check: verdict, rules, masked recipient, time, hashes and signature',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/receipt',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [throwOnApiError],
					},
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Receipt ID',
		name: 'receiptId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'cc_rcpt_0123456789ABCDEF',
		description:
			'The receipt ID from a check, for example cc_rcpt_0123456789ABCDEF. A link to the receipt page also works.',
		displayOptions: {
			show: {
				resource: ['receipt'],
				operation: ['get'],
			},
		},
		routing: {
			send: {
				preSend: [setReceiptId],
			},
		},
	},
];
