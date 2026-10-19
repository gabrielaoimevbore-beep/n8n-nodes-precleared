import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { checkDescription } from './resources/check';
import { keyDescription } from './resources/key';
import { receiptDescription } from './resources/receipt';

export class Precleared implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Precleared',
		name: 'precleared',
		icon: { light: 'file:precleared.svg', dark: 'file:precleared.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Check whether a cold or marketing email may be sent to a recipient, with the deciding rule, footer requirements and a signed receipt',
		defaults: {
			name: 'Precleared',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'preclearedApi', required: true }],
		requestDefaults: {
			baseURL: 'https://precleared.dev',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Check',
						value: 'check',
					},
					{
						name: 'Key',
						value: 'key',
					},
					{
						name: 'Receipt',
						value: 'receipt',
					},
				],
				default: 'check',
			},
			...checkDescription,
			...keyDescription,
			...receiptDescription,
		],
	};
}
