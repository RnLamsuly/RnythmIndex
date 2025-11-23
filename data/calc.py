import math

def calculate_expected_score(player_score, opponent_score):
    """计算预期胜率"""
    return 1.0 / (1.0 + math.pow(10.0, (opponent_score - player_score) / 400.0))

def main():
    K_FACTOR = 24
    PARTICIPATION_BONUS = 0
    
    print("请输入参赛人数: ")
    n = int(input().strip())
    
    players = []  # 存储玩家ID和比赛前分数
    player_scores = {}  # 用于存储和查找玩家分数
    
    print("请按排名从高到低输入玩家ID和分数:")
    for i in range(n):
        data = input().strip().split()
        player_id = data[0]
        score = int(data[1])
        players.append((player_id, score))
        player_scores[player_id] = score
    
    # 计算每个玩家的分数变化
    score_changes = {}
    
    for i in range(n):
        player_id = players[i][0]
        player_score = players[i][1]
        player_rank = i
        
        # 计算实际得分（第k名获得n-k分）
        actual_score = n - player_rank - 1
        
        # 计算预期得分
        expected_score = 0.0
        for j in range(n):
            if j != i:
                opponent_id = players[j][0]
                opponent_score = players[j][1]
                expected_score += calculate_expected_score(player_score, opponent_score)
        
        # 计算分数变化
        score_change = round(K_FACTOR * (actual_score - expected_score))
        score_changes[player_id] = score_change
        
        # 输出详细计算过程
        print(f"玩家 {player_id} (原分数:{player_score}, 排名:{player_rank + 1}):")
        print(f"  实际得分:{actual_score}, 预期得分:{expected_score:.2f}, 分数变化:{score_change:+}")
    
    # 计算并输出更新后的分数（按ID升序）
    print("\n更新后的分数（按ID升序）:")
    
    # 提取所有ID并排序
    all_ids = sorted([player[0] for player in players])
    
    # 输出更新后的分数
    for player_id in all_ids:
        old_score = player_scores[player_id]
        change = score_changes[player_id]
        new_score = old_score + change + PARTICIPATION_BONUS
        
        print(f"{player_id} {new_score}")
        
        # 详细输出
        print(f"  {player_id}: {old_score} -> {new_score} ({change:+} + {PARTICIPATION_BONUS})")

if __name__ == "__main__":
    main()