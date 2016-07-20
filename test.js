/* eslint-disable import/no-unresolved */
import stick from 'htz-stick';
/* eslint-enable import/no-unresolved */

const first = stick(
  stick1
);
window.first = first;

const second = stick(
  stick2,
  {
    topSpacing: stick1,
  }
);
window.second = second;

const third = stick(
  stick3,
  {
    stickAfter: stickHere,
    topSpacing: stick2,
  }
);
window.third = third;

const fourth = stick(
  stick4,
  {
    topSpacing: 48,
  }
);
window.fourth = fourth;

const fifth = stick(
  stick5,
  {
    stickAfter: wrapper,
    delta: 50,
    direction: 'up',
  }
);
window.fifth = fifth;
