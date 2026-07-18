import {FaHandsHelping, FaVoteYea} from 'react-icons/fa'

import {CmsLink} from '@/components/cms-link'

/* Fixed bottom bar on small screens so Donate and Volunteer are always one
 * tap away, no matter how far down the page someone is. Hidden at md and up;
 * the body reserves matching bottom padding in globals.css. */
export function MobileActionBar({
  donateUrl,
  volunteerUrl,
}: {
  donateUrl?: string
  volunteerUrl?: string
}) {
  if (!donateUrl && !volunteerUrl) return null
  return (
    <div className="mobile-action-bar" role="navigation" aria-label="Donate and volunteer">
      {donateUrl ? (
        <CmsLink className="btn btn-primary mobile-action-btn" href={donateUrl}>
          <FaVoteYea aria-hidden />
          Donate
        </CmsLink>
      ) : null}
      {volunteerUrl ? (
        <CmsLink className="btn btn-outline mobile-action-btn" href={volunteerUrl}>
          <FaHandsHelping aria-hidden />
          Volunteer
        </CmsLink>
      ) : null}
    </div>
  )
}
