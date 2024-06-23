import React, { useState, useEffect } from 'react';
import groupListData from './groupListData';

const App = () => {
  const [selectOptions, setSelectOptions] = useState([]);
  const [isEnabled, setIsEnabled] = useState(Array(groupListData.groupList.length).fill(false));
  const [optionList, setOptionList] = useState([]);

  // 정적 데이터로서의 품목 그룹 리스트
  const groupList = groupListData.groupList;
  const countList = groupListData.countList;

  // 함수: 선택 가능한 옵션과 라벨 생성
  const getOptionList = (index, update) => {
    const nextIndex = index + 1;
    const updateList = groupList[nextIndex].options.map(option => {
      const availableOption = countList.some(item => {
        let available = true;
        for (let i = 0; i <= index; i++) {
          if (update[i]) {
            if (item.combination[i] !== update[i].value) {
              available = false;
              break;
            }
          } else {
            available = false;
            break;
          }
        }
        return available && item.combination[nextIndex] === option && item.remainCount !== 0;
      });

      const countLabel = countList.find(item => {
        let match = true;
        for (let i = 0; i <= index; i++) {
          if (update[i]) {
            if (item.combination[i] !== update[i].value) {
              match = false;
              break;
            }
          } else {
            match = false;
            break;
          }
        }
        return match && item.combination[nextIndex] === option;
      })?.remainCount;

       const label = availableOption ? `${option} (${countLabel} 개 남음)` : `${option} (품절)`;
       return {
        value: option,
        label: label,
        isDisabled: !availableOption
      };
    });

    return updateList;
  };

  // 각 그룹의 옵션을 선택할 때 처리 함수
  const handleChange = (event, index) => {
    // 현재 셀렉터에서 선택한 옵션
    const selectedOption = optionList[index].find(option => option.value === event.target.value);

    // 옵션 배열을 복사하여 업데이트
    const updateOptions = selectOptions.slice();
    updateOptions[index] = selectedOption;
    setSelectOptions(updateOptions);

    // 현재 셀렉터 다음의 셀렉터를 enable
    if (index < groupList.length - 1) {
      const updatedIsEnabled = isEnabled.slice(); // isEnabled 배열 복사
      updatedIsEnabled[index + 1] = true;
      setIsEnabled(updatedIsEnabled);
    }

    // 다음 셀렉터의 옵션 리스트 업데이트
    if (index < groupList.length - 1) {
      const updateOptionList = getOptionList(index, updateOptions);

      // optionList 배열 복사
      const listArray = optionList.slice();
      listArray[index + 1] = updateOptionList;
      setOptionList(listArray);
    }
  };

  // 초기화 시 첫 번째 셀렉털를 enable
  useEffect(() => {
    setIsEnabled(updateIsEnabled => {
      return updateIsEnabled.map((value, index) => {
        return index === 0 ? true : value;
      });
    });
  }, []);

  // 각 셀렉터의 옵션 설정
  useEffect(() => {
    const updateOptionList = groupList.map((group, index) => {
      if (index === 0) {
        // 첫 번째 셀렉터의 옵션 설정
        return group.options.map(option => {
          const availableOption = countList.some(item => item.combination[0] === option && item.remainCount !== 0);
          const label = availableOption ? option : `${option} (품절)`;
          return {
            value: option,
            label: label,
            isDisabled: !availableOption
          };
        });
      } else if (index > 0 && selectOptions[index - 1]) {
        // 이전 셀렉터의 선택 옵션과 현재 셀렉터의 옵션 조합에 따라 remainCount를 확인하여 품절 여부를 설정
        const prevSelectOption = selectOptions[index - 1];
        return group.options.map(option => {
          const availableOption = countList.some(item =>
            item.combination[index - 1] === prevSelectOption.value &&
            item.combination[index] === option &&
            item.remainCount !== 0
          );
          const countLabel = countList.find(item =>
            item.combination[index - 1] === prevSelectOption.value &&
            item.combination[index] === option)?.remainCount;
          const label = availableOption ? `${option} (${countLabel} 개 남음)` : `${option} (품절)`;
          return {
            value: option,
            label: label,
            isDisabled: !availableOption
          };
        });
      } else {
        return [];
      }
    });

    setOptionList(updateOptionList);
  }, [countList, groupList, selectOptions]);

  return (
    <div>
      {groupList.map((group, index) => (
        <div key={index}>
          <h2>{group.title}</h2>
          <select
            value={selectOptions[index] ? selectOptions[index].value : ''}
            onChange={(event) => handleChange(event, index)}
            disabled={index === 0 ? false : !isEnabled[index]}
          >
            <option value="" disabled={true}>{group.title}</option>
            {optionList[index]?.map((option, idx) => (
              <option key={idx} value={option.value} disabled={option.isDisabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <h4>선택한 옵션:</h4>
      {selectOptions.map((option, index) => (
        <p key={index}>
          {groupList[index]?.title}: {option ? option.label : '-'}
        </p>
      ))}
    </div>
  );
};

export default App;