import {
    IsPC
} from '@/common/js/utils'
export const mixinsDeviceReturn = {
    methods: {
        deviceReturn (path) {
            if (!IsPC()) {
                pushHistory();
                this.gotoURL(() => {
                    pushHistory();
					this.$router.push({
						path: `${path}`
					})
                })
            }
        }
    }
}