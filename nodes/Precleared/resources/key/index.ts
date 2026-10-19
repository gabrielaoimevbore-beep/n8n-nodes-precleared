import type { INodeProperties } from 'n8n-workflow';
import { throwOnApiError } from '../../shared/hooks';

export const keyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['key'],
			},
		},
		options: [
			{
				name: 'Get Usage',
				value: 'getUsage',
				action: 'Get key usage',
				description:
					"Get today's free checks left and the pack credits on this API key. Does not use a check.",
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/key',
						ignoreHttpStatusErrors: true,
					},
					output: {
						postReceive: [throwOnApiError],
					},
				},
			},
		],
		default: 'getUsage',
	},
];
