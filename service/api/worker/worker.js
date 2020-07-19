const fetch     = require('node-fetch');
const Bluebird  = require('bluebird');
const stringify = require('qs-stringify');
fetch.Promise   = Bluebird;

module.exports = {
	worker: function (options, req, res) {

		// #1 Start Scrape
		fetch(`${options.api}/api/fetch/${options.device}`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': `Bearer ${options.token}`,
			},
			body: stringify({
				url: options.url
			})
		})
			.then(res => res.json())
			// #2 Fetch url
			.then((data) => {

				let key = data.data.key;

				fetch(`${options.api}/api/storage/migrate`, {
					method: 'post',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Authorization': `Bearer ${options.token}`
					},
					body: stringify({
						key: key
					})
				})
					.then(res => res.json())

					// #3 Migrate
					.then((data) => {

						let html = data.data.html
						let image = data.data.image

						fetch(`${options.api}/api/scrape`, {
							method: 'post',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
								'Authorization': `Bearer ${options.token}`
							},
							body: stringify({
								cache: html,
								url: options.url,
								key: key
							})
						})
							.then(res => res.json())

							// #4 Migrate storage
							.then((data) => {

								fetch(`${options.api}/api/data/results/${key}`, {
									method: 'get',
									headers: {
										'Authorization': `Bearer ${options.token}`
									}
								})
									.then(res => res.json())

									// #5 Get Data from Firebase
									.then((data) => {
										res.status(201).json({
											status: 201,
											time: Date.now(),
											message: "success",
											key: key,
											url: options.url,
											device: options.device,
											storage: {
												html: html,
												image: image
											},
											data: data.data.data
										})
									})
							})
							.catch((err) => {
								res.status(500).json({
									status: 500,
									time: Date.now(),
									message: `${err}`,
									data: null
								})
							})
					})
					.catch((err) => {
						res.status(500).json({
							status: 500,
							time: Date.now(),
							message: `${err}`,
							data: null
						})
					})
			})
			.catch((err) => {
				res.status(500).json({
					status: 500,
					time: Date.now(),
					message: `${err}`,
					data: null
				})
			})
	}
};