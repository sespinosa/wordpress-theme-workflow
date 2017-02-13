import pretty from 'pretty'



const mergeHtml = ({ index, header, content, footer }) => {
	let retHtml = index.replace("<?php get_header(); ?>", header)
	retHtml = retHtml.replace("<?php get_template_part( 'content', get_post_format() ); ?>", content)
	retHtml = retHtml.replace("<?php get_footer(); ?>", footer)

	retHtml = retHtml.split("<?php bloginfo('template_directory');?>").join('')

	return(pretty(retHtml))

}

export default (streams) => {
	return new Promise((resolveGlobal, rejectGlobal) => {
		const promises = {}

		Object.keys(streams).forEach((k) => {
			promises[k] = new Promise((resolve, reject) => {
				let data = ''

				streams[k].on('data', (chunk) => {
					data += chunk
				})

				streams[k].on('end', () => {
					console.log(`${k}  resolved`)
					resolve(data)
				})

				streams[k].on('error', (e) => {
					reject(e)
				})
			})
		})

		const { index, header, content, footer } = promises

		Promise.all([index, header, content, footer]).then((values) => {
			resolveGlobal(
				mergeHtml({
					index: values[0],
					header: values[1],
					content: values[2],
					footer: values[3]
				}
			))
		})
		.catch((e) => {
			rejectGlobal(e)
		})
	})
}
