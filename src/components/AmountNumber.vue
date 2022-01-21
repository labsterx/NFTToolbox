<template>
	<span v-html="formattedNumber"></span>
</template>

<script>

export default {
	name: 'AmountNumber',
	props: {
		value: { },
		digits: { },
		keepzeros: { type: Boolean, default: false }
	},
	data () {
		return {}
	},
	computed: {
		formattedNumber: function () {
			let val = Number(this.value)
			// console.log(val)
			const digits = (this.digits !== undefined)? this.digits : 6
			if (val === null || val === undefined) {
				// console.log('undefined')
				return ''
			}
			else if (isNaN(val)) {
				// console.log('not number')
				val = parseFloat(val)
				return parseFloat(val.toFixed(digits))
			}
			else {
				if (val === 0) {
					return 0
				}
				else {
					if (this.keepzeros) {
						let str = val.toFixed(digits).toString()
						str = str.replace(/\.0/, '.X')
						str = str.replace(/(0+)$/, `<span style="color: #7b7b7b">$1</span>`)
						str = str.replace(/\.X/, '.0')
						return str
					}
					else {
						return parseFloat(val.toFixed(digits))
					}
				}
			}
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
