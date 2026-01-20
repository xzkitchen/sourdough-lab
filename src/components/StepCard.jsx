import React, { useState } from 'react';

/**
 * 格式化 tip 文本，将【标签】高亮
 */
function formatTip(tip) {
  // 匹配 【xxx】 格式
  const match = tip.match(/^(【[^】]+】)(.*)/);
  if (match) {
    return (
      <>
        <span className="text-amber-400 font-semibold">{match[1]}</span>
        <span className="text-neutral-300">{match[2]}</span>
      </>
    );
  }
  return <span className="text-neutral-300">{tip}</span>;
}

/**
 * 步骤卡片组件
 * @param {object} step - 步骤数据 { id, title, duration, tips, ingredients }
 * @param {boolean} isDone - 是否完成
 * @param {function} onToggle - 切换完成状态
 * @param {ReactNode} children - 子组件（如冷藏追踪器）
 */
export function StepCard({ step, isDone, onToggle, children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div 
      className={`step-card cursor-pointer ${isDone ? 'completed' : ''}`}
      onClick={handleClick}
    >
      {/* 头部：标题 + 复选框 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="step-title">{step.title}</h3>
            {step.duration && (
              <span className="step-duration">{step.duration}</span>
            )}
          </div>
        </div>
        
        {/* 复选框 */}
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onClick={(e) => e.stopPropagation()}
          className="step-checkbox"
        />
      </div>
      
      {/* 配料标签 */}
      {step.ingredients && step.ingredients.length > 0 && (
        <div className="ingredients-grid">
          {step.ingredients.map((ing, idx) => (
            <div key={idx} className="ingredient-badge">
              <span>{ing.name}</span>
              <span className="value">
                {ing.value}{ing.unit || 'g'}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Tips 列表 - 展开时显示 */}
      {isExpanded && step.tips && step.tips.length > 0 && (
        <ul className="tips-list">
          {step.tips.map((tip, idx) => (
            <li key={idx}>{formatTip(tip)}</li>
          ))}
        </ul>
      )}
      
      {/* 子组件插槽（如冷藏追踪器） */}
      {isExpanded && children && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
      
      {/* 展开/收起提示 */}
      <div className="mt-3 text-center">
        <span className="text-[10px] text-neutral-500">
          {isExpanded ? '点击收起' : '点击展开详情'}
        </span>
      </div>
    </div>
  );
}
