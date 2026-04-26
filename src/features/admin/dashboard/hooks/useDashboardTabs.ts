import { useEffect, useRef, useState, type RefCallback } from 'react';

type TabIndicatorStyle = {
  left: number;
  width: number;
};

export const useDashboardTabs = <T extends string>(activeId: T) => {
  const tabElementMapRef = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<TabIndicatorStyle>({
    left: 0,
    width: 0,
  });

  const setTabRef = (id: T): RefCallback<HTMLButtonElement> => {
    return element => {
      tabElementMapRef.current[id] = element;
    };
  };

  useEffect(() => {
    const updateIndicatorStyle = () => {
      const activeTabElement = tabElementMapRef.current[activeId];

      if (!activeTabElement) {
        return;
      }

      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    };

    const activeTabElement = tabElementMapRef.current[activeId];

    updateIndicatorStyle();

    window.addEventListener('resize', updateIndicatorStyle);

    if (!activeTabElement) {
      return () => {
        window.removeEventListener('resize', updateIndicatorStyle);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateIndicatorStyle();
    });

    resizeObserver.observe(activeTabElement);

    return () => {
      window.removeEventListener('resize', updateIndicatorStyle);
      resizeObserver.disconnect();
    };
  }, [activeId]);

  return {
    indicatorStyle,
    setTabRef,
  };
};
