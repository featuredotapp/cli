const acceptedDomains = [
  process.env.MAILSCRIPT_EMAIL_DOMAIN || 'mailscript.com',
]

function parseIntoParts(address: string) {
  if (!address) {
    return { parsed: false, error: 'No address provided' }
  }

  if (!address.includes('@')) {
    return { parsed: false, error: 'Email address must include @' }
  }

  const parts = address.split('@')

  if (parts.length > 2) {
    return { parsed: false, error: 'Not a correctly formatted email address' }
  }

  const localPart = parts[0]
  const domainPart = parts[1]

  const domainSubparts = domainPart.split('.')

  if (domainSubparts.length === 1 || domainSubparts.length > 3) {
    return { parsed: false, error: 'Not a correctly formatted domain' }
  }

  if (domainSubparts.length === 2) {
    if (!acceptedDomains.includes(domainPart)) {
      return { parsed: false, error: 'Not an allowed domain' }
    }

    return {
      parsed: true,
      localPart,
      subdomain: null,
      domain: domainPart,
    }
  }

  const subdomain = domainSubparts[0]
  const domain = `${domainSubparts[1]}.${domainSubparts[2]}`
  if (!acceptedDomains.includes(domain)) {
    return { parsed: false, error: 'Not an allowed domain' }
  }

  return {
    parsed: true,
    localPart,
    subdomain,
    domain,
  }
}

function replaceDotsAndDashes(text: string) {
  return text ? text.replace(/\./g, '').replace(/-/g, '') : text
}

function removeAfterPlus(text: string) {
  return text ? text.split('+')[0] : text
}

function substituteLocalPart(localPart: string) {
  return removeAfterPlus(replaceDotsAndDashes(localPart))
}

function substituteDomain(localPart: string) {
  return replaceDotsAndDashes(localPart)
}

function checkLocalPartCharacters(text: string) {
  return /^[a-zA-Z0-9\-.+]+$/.test(text)
}

function checkCharacters(text: string) {
  return /^[a-zA-Z0-9\-.]+$/.test(text)
}

function checkOnlyOnePlusSection(text: string) {
  return /^[a-zA-Z0-9\-.]+(\+[a-zA-Z0-9\-.]+)?$/.test(text)
}

export default function resolveBaseAddress(address: string) {
  if (!address) {
    throw new Error('No address provided')
  }

  const sanitized = address.toLowerCase().trim()

  if (!acceptedDomains.some((ad) => address.endsWith(ad))) {
    return address
  }

  const result = parseIntoParts(sanitized)

  const { parsed, error } = result

  if (!parsed) {
    throw new Error(error)
  }

  const { localPart, subdomain, domain } = result

  if (!checkLocalPartCharacters(localPart!) || !checkCharacters(subdomain!)) {
    throw new Error('Only letters and numbers allowed as characters')
  }

  if (!checkOnlyOnePlusSection(localPart!)) {
    throw new Error('Only one plus in local part' + localPart)
  }

  const updatedlocalPart = substituteLocalPart(localPart!)
  const updatedSubdomain = substituteDomain(subdomain!)

  if (!subdomain) {
    return `${updatedlocalPart}@${domain}`
  }

  return `${updatedlocalPart}@${updatedSubdomain}.${domain}`
}
