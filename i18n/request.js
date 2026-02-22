import deepmerge from 'deepmerge'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
    const locale = 'it'

    const userMessages = (await import(`../translations/${locale}.json`)).default
    const defaultMessages = (await import(`../translations/it.json`)).default
    const messages = deepmerge(defaultMessages, userMessages)

    return {
        locale,
        messages,
        timeZone: 'Europe/Rome',
    }
})
