// Moves the clock of a Node.js process to SCREENSHOT_TIME and lets it run on
const RealDate = Date;
const offset = RealDate.parse(process.env.SCREENSHOT_TIME ?? "") - RealDate.now();

// A Date whose current moment is shifted by the offset
class MovedDate extends RealDate {
  constructor(...args) {
    super(...(args.length === 0 ? [RealDate.now() + offset] : args));
  }

  // The moved current moment in milliseconds
  static now() {
    return RealDate.now() + offset;
  }
}

if (Number.isFinite(offset)) globalThis.Date = MovedDate;
