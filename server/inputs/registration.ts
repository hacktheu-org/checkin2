/// <reference path="../../apis/registration.d.ts" />
import * as request from "request-promise-native";

interface IRegistrationOpts {
	url: string;
	key: string;
}

export class Registration {
	url: string;
	key: string;

	constructor(opts: IRegistrationOpts) {
		this.url = opts.url;
		this.key = opts.key;
	}

	async user(id: string, selection_set: string[]) {
		const vars = selection_set.map((_, i) => `$select_${i}`).join(" ");
		const var_map: {[selection: string]: string} = {};

		selection_set.forEach((selection, i, _) => {
			var_map[`$select_${i}`] = selection;
		}, {});

		const result = await this.query(`{
			user(id: $id) {
				${vars}
			}
		}`, var_map);
		return result.user;
	}

	async question_branches() {
		const result = await this.query(`{ question_branches }`);
		return result.question_branches;
	}

	async question_names(branch?: string) {
		let result;
		if (branch) {
			result = await this.query(`{
				question_names(branch: $branch)
			}`, {
				branch
			});
		}
		else {
			result = await this.query(`{ question_names }`);
		}
	}

	async query(query: string, variables?: { [name: string]: string }): Promise<GQL.IQuery> {
		const key = new Buffer(this.key).toString("base64");
		const response: GQL.IGraphQLResponseRoot = await request({
			uri: this.url,
			method: "POST",
			json: true,
			headers: {
				Authorization: `Basic ${key}`
			},
			body: {
				query,
				variables: variables || {}
			}
		});
		if (response.data) {
			return response.data;
		}
		else {
			throw new Error(JSON.stringify(response.errors));
		}
	}
}
