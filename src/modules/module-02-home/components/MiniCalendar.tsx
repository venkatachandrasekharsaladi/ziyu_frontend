import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { CALENDAR_COPY } from '@/copy/calendar'
import { HOME_DASHBOARD_COPY as COPY } from '@/copy/homeDashboard'
import { Text } from '@/design-system/primitives/Text'
import { MONTHS, monthGrid } from '@/modules/module-02-home/screens/CalendarScreen'

type MiniCalendarProps = {
  year: number
  month: number
  today: number
  /** Day-of-month numbers to mark — the couple's key dates falling this month. */
  markedDays: Set<number>
  onPress: () => void
}

/**
 * The current month, small — Home's door into the full `CalendarScreen`.
 *
 * A marked day gets a heart rather than the full calendar's plain dot: this
 * is a teaser meant to be glanced at, and a heart reads as "something of
 * yours is here" at a glance in a way a grey dot does not.
 */
export function MiniCalendar({ year, month, today, markedDays, onPress }: MiniCalendarProps) {
  const { theme } = useUnistyles()

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={COPY.calendarWidgetLabel(MONTHS[month]!, year)}
    >
      <View style={styles.head}>
        <Text variant="labelStrong" tone="heading">
          {CALENDAR_COPY.monthLabel(MONTHS[month]!, year)}
        </Text>
        <Feather name="chevron-right" size={16} color={theme.colors.brand.primary} />
      </View>

      <View style={styles.week}>
        {CALENDAR_COPY.weekdays.map((d, i) => (
          <View key={`${d}-${i}`} style={styles.cell}>
            <Text variant="caption" tone="body" align="center">
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {monthGrid(year, month).map((day, i) => {
          const isToday = day === today

          return (
            <View key={i} style={styles.cell}>
              {day === null ? null : (
                <View style={[styles.day, isToday ? styles.dayToday : null]}>
                  <Text variant="caption" tone={isToday ? 'onPrimary' : 'heading'} align="center">
                    {day}
                  </Text>
                  {markedDays.has(day) ? (
                    <Feather
                      name="heart"
                      size={8}
                      color={isToday ? theme.colors.text.onPrimary : theme.colors.brand.primary}
                      style={styles.heart}
                    />
                  ) : null}
                </View>
              )}
            </View>
          )
        })}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  week: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 2,
  },
  day: {
    width: 26,
    height: 26,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    backgroundColor: theme.colors.brand.primary,
  },
  heart: {
    position: 'absolute',
    bottom: -2,
  },
}))
