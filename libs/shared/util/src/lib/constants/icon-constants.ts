import {
  faCodepen,
  faGithub,
  faLinkedin,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons';
import {
  faGlobe,
  faLink,
  faEnvelope,
  faPhone,
  faLocationDot,
  faFileArrowDown,
  faXmark,
  faChevronUp,
  faChevronDown,
  faPlus,
  faBriefcase,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

export const Icon = {
  faLinkedin,
  faGlobe,
  faGithub,
  faCodepen,
  faLink,
  faLocationDot,
  faEnvelope,
  faPhone,
  faFileArrowDown,
  faXmark,
  faChevronUp,
  faChevronDown,
  faPlus,
  faBriefcase,
  faTrashCan,
} as const satisfies Record<string, IconDefinition>;
