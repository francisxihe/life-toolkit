import { Container, ContainerFixed, ContainerShrink } from './Container';

const FlexibleContainer = Object.assign(Container, {
  Fixed: ContainerFixed,
  Shrink: ContainerShrink,
});

export default FlexibleContainer;
