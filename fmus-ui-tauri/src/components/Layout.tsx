import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  useMantineTheme,
  NavLink,
  Group,
  ActionIcon,
  Tooltip,
  Text,
} from '@mantine/core';
import {
  IconHome,
  IconBrandGraphql,
  IconBrandHtml5,
  IconSitemap,
  IconSettings,
  IconWorld,
  IconMoonStars,
  IconSun,
} from '@tabler/icons-react';

interface LayoutProps {
  children: React.ReactNode;
  colorScheme: string;
  toggleColorScheme: () => void;
}

export function Layout({ children, colorScheme, toggleColorScheme }: LayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <IconHome size={16} />, label: 'Home', path: '/' },
    { icon: <IconBrandHtml5 size={16} />, label: 'HTTP', path: '/http' },
    { icon: <IconBrandGraphql size={16} />, label: 'GraphQL', path: '/graphql' },
    { icon: <IconWorld size={16} />, label: 'WebSockets', path: '/websocket' },
    { icon: <IconSitemap size={16} />, label: 'Collections', path: '/collections' },
    { icon: <IconSettings size={16} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
              hiddenFrom="sm"
            />
            <Text fw={700} size="lg">FMUS-POST</Text>
          </Group>
          <Tooltip label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}>
            <ActionIcon
              variant="default"
              onClick={toggleColorScheme}
              size={30}
            >
              {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            leftSection={item.icon}
            label={item.label}
            active={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setOpened(false);
            }}
            py="xs"
            my="xs"
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
