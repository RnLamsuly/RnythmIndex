#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>
#include <cmath>
#include <iomanip>

using namespace std;

// ELO计算函数
double calculateExpectedScore(int playerScore, int opponentScore) {
    return 1.0 / (1.0 + pow(10.0, (opponentScore - playerScore) / 400.0));
}

int main() {
    const int K_FACTOR = 24;
    const int PARTICIPATION_BONUS = 3;
    
    int n;
    cout << "请输入参赛人数: ";
    cin >> n;
    
    vector<pair<string, int>> players(n); // 存储玩家ID和比赛前分数
    map<string, int> playerScores; // 用于存储和查找玩家分数
    map<string, string> playerNames; // 存储玩家名称（如果需要）
    
    cout << "请按排名从高到低输入玩家ID和分数:" << endl;
    for (int i = 0; i < n; i++) {
        string id;
        int score;
        cin >> id >> score;
        players[i] = {id, score};
        playerScores[id] = score;
    }
    
    // 计算每个玩家的分数变化
    map<string, int> scoreChanges;
    
    for (int i = 0; i < n; i++) {
        string playerId = players[i].first;
        int playerScore = players[i].second;
        int playerRank = i;
        
        // 计算实际得分（第k名获得n-k分）
        int actualScore = n - playerRank - 1;
        
        // 计算预期得分
        double expectedScore = 0.0;
        for (int j = 0; j < n; j++) {
            if (j != i) {
                string opponentId = players[j].first;
                int opponentScore = players[j].second;
                expectedScore += calculateExpectedScore(playerScore, opponentScore);
            }
        }
        
        // 计算分数变化
        int scoreChange = static_cast<int>(round(K_FACTOR * (actualScore - expectedScore)));
        scoreChanges[playerId] = scoreChange;
        
        // 输出详细计算过程（可选）
        cout << "玩家 " << playerId << " (原分数:" << playerScore 
             << ", 排名:" << (playerRank + 1) << "):" << endl;
        cout << "  实际得分:" << actualScore 
             << ", 预期得分:" << fixed << setprecision(2) << expectedScore
             << ", 分数变化:" << (scoreChange >= 0 ? "+" : "") << scoreChange << endl;
    }
    
    // 计算并输出更新后的分数（按ID升序）
    cout << "\n更新后的分数（按ID升序）:" << endl;
    
    // 提取所有ID并排序
    vector<string> allIds;
    for (const auto& player : players) {
        allIds.push_back(player.first);
    }
    sort(allIds.begin(), allIds.end());
    
    // 输出更新后的分数
    for (const string& id : allIds) {
        int oldScore = playerScores[id];
        int change = scoreChanges[id];
        int newScore = oldScore + change + PARTICIPATION_BONUS;
        
        cout << id << " " << newScore << endl;
        
        // 详细输出（可选）
        cout << "  " << id << ": " << oldScore << " -> " << newScore 
             << " (" << (change >= 0 ? "+" : "") << change 
             << " + " << PARTICIPATION_BONUS << ")" << endl;
    }
    
    return 0;
}