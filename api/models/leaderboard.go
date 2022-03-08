package models

type Leaderboard struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	MemberIds []string
	StatsIds  []string
}

type LeaderboardStat struct {
	Day   int         `json:"day"`
	Stats []*UserStat `json:"stats"`
}

type UserStat struct {
	Day        int       `json:"day"`
	GuessCount int       `json:"guessCount"`
	GameState  GameState `json:"gameState"`
}
