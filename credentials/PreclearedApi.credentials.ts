import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class PreclearedApi implements ICredentialType {
	name = 'preclearedApi';

	displayName = 'Precleared API';

	icon: Icon = {
		light: 'file:../nodes/Precleared/precleared.svg',
		dark: 'file:../nodes/Precleared/precleared.dark.svg',
	};

	documentationUrl =
		'https://github.com/gabrielaoimevbore-beep/n8n-nodes-precleared?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Your Precleared API key. It starts with pc_live_. Get a free one at https://precleared.dev/get-key.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Checks the key without using a check: 200 for a good key, 401 otherwise.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://precleared.dev',
			url: '/api/v1/key',
			method: 'GET',
		},
	};
}
