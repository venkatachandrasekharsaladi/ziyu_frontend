import { render, screen, userEvent } from '@testing-library/react-native'

import { DateField, isValidBirthday } from '@/design-system/primitives/DateField'

describe('isValidBirthday', () => {
  it('accepts a real date', () => {
    expect(isValidBirthday(1994, 7, 21)).toBe(true)
  })

  it('rejects a day the month does not have', () => {
    // The round-trip check is what catches this. Date would otherwise roll
    // 31 February forward to 3 March and report success.
    expect(isValidBirthday(1994, 2, 31)).toBe(false)
  })

  it('rejects a future date', () => {
    expect(isValidBirthday(3000, 1, 1)).toBe(false)
  })

  it('rejects an out-of-range month', () => {
    expect(isValidBirthday(1994, 13, 1)).toBe(false)
  })

  it('rejects an implausibly distant year', () => {
    expect(isValidBirthday(1500, 1, 1)).toBe(false)
  })
})

describe('DateField', () => {
  async function type(label: string, text: string) {
    await userEvent.type(screen.getByLabelText(label), text)
  }

  it('stays empty while any segment is unfilled', async () => {
    const onChangeText = jest.fn()
    await render(<DateField label="Birthday" value="" onChangeText={onChangeText} />)

    await type('Birthday month', '07')
    await type('Birthday day', '21')

    // The year is still missing, so there is no date to report yet.
    expect(onChangeText).not.toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-/))
  })

  it('emits a complete but impossible date rather than swallowing it', async () => {
    // Swallowing 31 February would make "invalid" and "empty" the same value,
    // so the schema could not tell them apart and the form would submit blank
    // with no message. See spec section 10.
    const onChangeText = jest.fn()
    await render(<DateField label="Birthday" value="" onChangeText={onChangeText} />)

    await type('Birthday month', '02')
    await type('Birthday day', '31')
    await type('Birthday year', '1994')

    expect(onChangeText).toHaveBeenCalledWith('1994-02-31')
  })

  it('emits a real date', async () => {
    const onChangeText = jest.fn()
    await render(<DateField label="Birthday" value="" onChangeText={onChangeText} />)

    await type('Birthday month', '07')
    await type('Birthday day', '21')
    await type('Birthday year', '1994')

    expect(onChangeText).toHaveBeenCalledWith('1994-07-21')
  })

  it('renders three segments with mm/dd/yyyy placeholders', async () => {
    await render(<DateField label="Birthday" value="" onChangeText={() => {}} />)

    expect(screen.getByPlaceholderText('mm')).toBeTruthy()
    expect(screen.getByPlaceholderText('dd')).toBeTruthy()
    expect(screen.getByPlaceholderText('yyyy')).toBeTruthy()
  })

  it('renders its label', async () => {
    await render(<DateField label="Birthday" value="" onChangeText={() => {}} />)

    expect(screen.getByText('Birthday')).toBeTruthy()
  })

  it('splits an existing value across the segments', async () => {
    await render(<DateField label="Birthday" value="1994-07-21" onChangeText={() => {}} />)

    expect(screen.getByDisplayValue('07')).toBeTruthy()
    expect(screen.getByDisplayValue('21')).toBeTruthy()
    expect(screen.getByDisplayValue('1994')).toBeTruthy()
  })

  it('renders an error message', async () => {
    await render(
      <DateField label="Birthday" value="" onChangeText={() => {}} error="Enter a real date" />,
    )

    expect(screen.getByText('Enter a real date')).toBeTruthy()
  })

  it('labels each segment for a screen reader', async () => {
    await render(<DateField label="Birthday" value="" onChangeText={() => {}} />)

    expect(screen.getByLabelText('Birthday month')).toBeTruthy()
    expect(screen.getByLabelText('Birthday day')).toBeTruthy()
    expect(screen.getByLabelText('Birthday year')).toBeTruthy()
  })
})
